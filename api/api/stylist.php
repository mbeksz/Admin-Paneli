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
    $sql = "SELECT * from stylist";
            
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
    // tab_product_sliders tablosundan verileri çek
    $sql = "SELECT name, content FROM stylist WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stylist = $result->fetch_assoc();
        echo json_encode($stylist);
    } else {
        sendResponse(404, 'Page not found');
    }
}

function getDetailTab_product($conn, $id) {
    // tab_product_slider_tabs tablosundan verileri çek
    $sql = "SELECT name FROM tab_product_slider_tabs WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stylist = $result->fetch_assoc();
        echo json_encode($stylist);
    } else {
        sendResponse(404, 'Page not found');
    }
}

function createPage($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['page_title']) || !isset($data['content'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    // Log the incoming data to console (optional)
    error_log('Incoming data: ' . print_r($data, true));

    // Prepare and execute the SQL query
    $stmt = $conn->prepare("INSERT INTO stylist (name, content) VALUES (?, ?)");
    $stmt->bind_param("ss", $data['page_title'], $data['content']);

    if ($stmt->execute()) {
        sendResponse(201, 'Page created successfully');
    } else {
        sendResponse(500, 'Error creating page: ' . $stmt->error);
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

    // SQL sorgusunu hazırla
    $sql = "UPDATE stylist SET name=?, content=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $data['page_title'], $data['content'], $_GET['id']);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(201, 'Stylist updated successfully');
    } else {
        sendResponse(500, 'Error updating stylist: ' . $stmt->error);
    }
}




// İstek türünü ve URL'yi kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        getDetail($conn, $id);
    }
    elseif (isset($_GET['slider_id'])){
         getDetailTab_product($conn, $id);
        
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