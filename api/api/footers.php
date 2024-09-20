<?php

require('connect.php');


header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla

function getList($conn) {
    $sql = "SELECT id, title FROM footers";
            
    $result = $conn->query($sql);

    $pages = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $pages[] = $row;
        }
    }

    echo json_encode($pages);
}

function getDetail($conn, $id) {
    // pages tablosundan verileri çek
    $sql = "SELECT * FROM footers WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $page = $result->fetch_assoc();
        
        echo json_encode($page);
    } else {
        echo json_encode(['error' => 'Page not found']);
    }
}

function updatePage($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if ( !isset($data['page_title']) || !isset($data['content']) ) {
        sendResponse(400, 'Missing required fields');
        return;
    }
$id = intval($_GET['id']);

    // SQL sorgusunu hazırla
    $sql = "UPDATE footers SET title=?, content=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $data['page_title'], $data['content'], $id);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(201, 'Footer updated successfully');
    } else {
        sendResponse(500, 'Error updating stylist: ' . $stmt->error);
    }
}


function createPage($conn) {
    $data = json_decode(file_get_contents('php://input'), true);



    // Gerekli alanları kontrol et
    if (!isset($data['page_title']) || !isset($data['content'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }



    // Prepare and execute the SQL query
    $stmt = $conn->prepare("INSERT INTO footers (title, content) VALUES (?, ?)");
    $stmt->bind_param("ss", $data['page_title'], $data['content']);

    if ($stmt->execute()) {
        sendResponse(201, 'Page created successfully');
    }
    
}


// İstek türünü ve URL'yi kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        getDetail($conn, $id);
    } else {
        getList($conn);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_GET['id'])) {
        updatePage($conn);
    } else {
        createPage($conn);
    }
}


$conn->close();


?>