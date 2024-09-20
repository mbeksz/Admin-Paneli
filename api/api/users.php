<?php

require('connect.php');


header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla

function getList($conn) {
    // Kullanıcıları seçen SQL sorgusu
    $sql = "SELECT * FROM user_account";
    $result = $conn->query($sql);

    // Kullanıcı verilerini saklamak için dizi
    $pages = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $pages[] = $row;
        }
    }

    // Kullanıcı sayısını sayan SQL sorgusu
    $userCount = count($pages);

    // Sonuçları birleştirmek ve JSON olarak dönmek
    $response = [
        'user_count' => $userCount,
        'users' => $pages
    ];

    echo json_encode($response);
}


function getDetail($conn, $id) {
    // pages tablosundan verileri çek
    $sql = "SELECT * FROM user_account WHERE id = ?";
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
    $sql = "UPDATE user_account SET title=?, content=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $data['page_title'], $data['content'], $id);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(201, 'User updated successfully');
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
    $stmt = $conn->prepare("INSERT INTO user_account (title, content) VALUES (?, ?)");
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