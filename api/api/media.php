<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


include 'connect.php';

function sendResponse($status, $message, $data = null) {
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}


function createMedia($conn) {
    if (!isset($_FILES['file'])) {
        sendResponse(400, 'No file uploaded');
    }

    $file = $_FILES['file'];
    $fileName = pathinfo($file['name'], PATHINFO_FILENAME);
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filePath = 'media/';

    // options tablosundan site_path değerini al
    $sql = "SELECT value FROM options WHERE name = 'site_path'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $site_link = $row['value'];
    } else {
        sendResponse(500, 'Site path not found in options table');
    }
    
    $sitePath='../..';
    // Dosya yolunu oluştur
    $filePath = rtrim($sitePath, '/') . '/media/';

    // Dosya adını kontrol et ve var ise "_1" ekle
    $newFileName = $fileName;
    $counter = 1;
    while (file_exists($filePath . $newFileName . '.' . $fileExtension)) {
        $newFileName = $fileName . '_' . $counter;
        $counter++;
    }

    // Dosyayı medya klasörüne yükle
    $fullFilePath = $filePath . $newFileName . '.' . $fileExtension;
    if (move_uploaded_file($file['tmp_name'], $fullFilePath)) {
        $sql = "INSERT INTO media (file_name, file_extension, folder_path) VALUES ('$newFileName', '$fileExtension', '".$site_link.'media/'.$newFileName.'.'.$fileExtension."')";
        $stmt = $conn->prepare($sql);

        if ($stmt->execute()) {
            $mediaId = $stmt->insert_id; // Yeni eklenen satırın ID'sini al
            sendResponse(201, 'File uploaded and saved to database successfully', [
                'id' => $mediaId,
                'file_name' => $newFileName,
                'file_extension' => $fileExtension,
                'file_path' => $fullFilePath
            ]);
        } else {
            sendResponse(500, 'Error saving file to database: ' . $stmt->error);
        }
    } else {
        sendResponse(500, 'Error uploading file');
    }

}

function createMultipleMedia($conn) {
    if (!isset($_FILES['files'])) {
        sendResponse(400, 'No files uploaded');
    }

    $files = $_FILES['files'];
    $uploadedFiles = [];

    // options tablosundan site_path değerini al
    $sql = "SELECT value FROM options WHERE name = 'site_path'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $sitePath = $row['value'];
    } else {
        sendResponse(500, 'Site path not found in options table');
    }

    // Dosya yolunu oluştur
    $filePath = rtrim($sitePath, '/') . '/media/';

    foreach ($files['name'] as $index => $fileName) {
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileBaseName = pathinfo($fileName, PATHINFO_FILENAME);

        // Dosya adını kontrol et ve var ise "_1" ekle
        $newFileName = $fileBaseName;
        $counter = 1;
        while (file_exists($filePath . $newFileName . '.' . $fileExtension)) {
            $newFileName = $fileBaseName . '_' . $counter;
            $counter++;
        }

        // Dosyayı medya klasörüne yükle
        $fullFilePath = $filePath . $newFileName . '.' . $fileExtension;
        if (move_uploaded_file($files['tmp_name'][$index], $fullFilePath)) {
            // Veritabanına kaydet
            $sql = "INSERT INTO media (file_name, file_extension, folder_path) VALUES ('$newFileName', '$fileExtension', '".$site_link.'media/'.$newFileName.'.'.$fileExtension."')";
            $stmt = $conn->prepare($sql);


            if ($stmt->execute()) {
                $mediaId = $stmt->insert_id; // Yeni eklenen satırın ID'sini al
                $uploadedFiles[] = [
                    'id' => $mediaId,
                    'file_name' => $newFileName,
                    'file_extension' => $fileExtension,
                    'file_path' => $fullFilePath
                ];
            } else {
                sendResponse(500, 'Error saving file to database: ' . htmlspecialchars($stmt->error));
            }
        } else {
            sendResponse(500, 'Error uploading file');
        }
    }

    sendResponse(201, 'Files uploaded and saved to database successfully', $uploadedFiles);
}


function deleteMedia($conn) {
    // İstekten gelen JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];

    // Veritabanından dosya bilgilerini çek
    $sql = "SELECT * FROM media WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $media = $result->fetch_assoc();
        

        $file_path = '../../media/' . $media['file_name'] . '.' . $media['file_extension'];

        // Dosyayı sil
        if (file_exists($file_path)) {
            if (unlink($file_path)) {
                // Veritabanından kaydı sil
                $sql = "DELETE FROM media WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    sendResponse(200, 'File deleted successfully');
                } else {
                    sendResponse(500, 'Failed to delete record from database');
                }
            } else {
                sendResponse(500, 'Failed to delete file from server');
            }
        } else {
            sendResponse(404, 'File not found');
        }
    } else {
        sendResponse(404, 'Record not found');
    }
}


// İstek türünü kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (count($_FILES) === 1) {
        createMedia($conn);
    } elseif (count($_FILES) > 1) {
        createMultipleMedia($conn);
    } else {
        sendResponse(400, 'No files uploaded');
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    deleteMedia($conn);
} else {
    sendResponse(405, 'Method Not Allowed');
}
?>
