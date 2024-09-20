<?php

require('connect.php');


header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla


function sendResponse($status, $message) {
    http_response_code($status);
    echo json_encode(["message" => $message]);
    exit();
}

function getList($conn) {
    $sql = "SELECT * from category_slider";
            
    $result = $conn->query($sql);

    $menus = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            
            $menus[] = $row;
        }
    }

    echo json_encode($menus);
}

function getDetail($conn, $id) {
    $sql = "SELECT ip.*, m.file_name, m.file_extension 
            FROM category_slider ip
            LEFT JOIN media m ON ip.media_id = m.id
            WHERE ip.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $category_slider = $result->fetch_assoc();
        echo json_encode($category_slider);
    } else {
        sendResponse(404, 'Page not found');
    }
}



function createPost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['link']) || !isset($data['cover_image']) || !isset($data['title'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    error_log('Incoming data: ' . print_r($data, true));

    // Prepare and execute the SQL query
    $stmt = $conn->prepare("INSERT INTO category_slider (media_id, link, order_number, title) VALUES (?, ?, ?, ?)");
    $orderNumber = intval($data['order']); // order_number'ı integer olarak al

    $stmt->bind_param("isss", $data['cover_image'], $data['link'], $orderNumber, $data['title']);

    if ($stmt->execute()) {
        sendResponse(201, 'Page created successfully');
    } else {
        sendResponse(500, 'Error creating page: ' . $stmt->error);
    }
}



function updatePost($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['link']) || !isset($data['cover_image']) || !isset($data['title']) || !isset($data['order'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    // Gelen verileri güncelle
    $orderNumber = intval($data['order']); // order_number'ı integer olarak al

    // SQL sorgusunu hazırla
    $sql = "UPDATE category_slider SET media_id=?, link=?, order_number=?, title=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssi", $data['cover_image'], $data['link'], $orderNumber, $data['title'], $_GET['id']);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(200, 'category_slider updated successfully');
    } else {
        sendResponse(500, 'Error updating category_slider: ' . $stmt->error);
    }
}



if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        getDetail($conn, $id);
    }
    else {
        getList($conn);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
   if  (isset($_GET['id'])){
        updatePost($conn);
    } else {
        createPost($conn);
    }
}



$conn->close();


?>