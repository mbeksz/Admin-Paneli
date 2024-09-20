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
    $sql = "SELECT hc.id, hc.product_id, p.title 
            FROM home_cart hc
            INNER JOIN products p ON hc.product_id = p.id";
            
    $result = $conn->query($sql);

    $menus = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $menus[] = $row;
        }
    }

    echo json_encode($menus);
}



function getHomeCartDetail($conn, $id) {
    // home_cart tablosundan ve media tablosundan verileri çek
    $sql = "SELECT hc.product_id, hc.description, hc.order, m.file_name, m.file_extension
            FROM home_cart hc
            INNER JOIN media m ON hc.media_id = m.id
            WHERE hc.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $home_cart = $result->fetch_assoc();
        echo json_encode($home_cart);
    } else {
        sendResponse(404, 'Record not found');
    }
}



function createCart($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['order']) || !isset($data['cover_image']) || !isset($data['selectedProductID']) || !isset($data['desc'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    error_log('Incoming data: ' . print_r($data, true));

    // Order değerini integer'a dönüştür
    $order = intval($data['order']);

    // SQL sorgusunu düzeltin ve order kelimesini kaçış karakterleriyle belirtin
    $stmt = $conn->prepare("INSERT INTO home_cart (product_id, description, media_id, `order`) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isii", $data['selectedProductID'], $data['desc'], $data['cover_image'], $order);

    if ($stmt->execute()) {
        sendResponse(201, 'Cart created successfully');
    } else {
        sendResponse(500, 'Error creating page: ' . $stmt->error);
    }
}




function updateCart($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['description']) || !isset($data['cover_image']) || !isset($data['product_id']) || !isset($data['order'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    $description = $data['description'];
    $product_id = (int) $data['product_id']; // product_id'yi integer'a çevir
    $order = (int) $data['order']; // order'ı integer'a çevir
        $cover_image_id = (int) $data['cover_image']; // order'ı integer'a çevir

    $id = (int) $_GET['id']; // id'yi integer'a çevir

    // SQL sorgusunu hazırla
    $sql = "UPDATE home_cart SET description=?, product_id=?, `order`=?, media_id=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("siiii", $description, $product_id, $order, $cover_image_id, $id);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(201, 'home_cart updated successfully');
    } else {
        sendResponse(500, 'Error updating home_cart: ' . $stmt->error);
    }
}






// İstek türünü ve URL'yi kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        getHomeCartDetail($conn, $id);
    }
    else {
        getList($conn);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_GET['id'])) {
        updateCart($conn);
    } else {
        createCart($conn);
    }
}



$conn->close();


?>