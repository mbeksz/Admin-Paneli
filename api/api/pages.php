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
    $sql = "SELECT p.id, p.page_title, h.title as header_name, f.title as footer_name, p.creation_date
            FROM pages p
            LEFT JOIN headers h ON p.header_id = h.id
            LEFT JOIN footers f ON p.footer_id = f.id";
            
    $result = $conn->query($sql);

    $pages = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // creation_date sütununu Türkiye saat dilimine göre ayarla
            $row['creation_date'] = date('Y-m-d H:i:s', strtotime($row['creation_date']));
            $pages[] = $row;
        }
    }

    echo json_encode($pages);
}

function getDetail($conn, $id) {
    // pages tablosundan verileri çek
    $sql = "SELECT * FROM pages WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $page = $result->fetch_assoc();
        
        // headers tablosundan verileri çek
        $headerSql = "SELECT * FROM headers WHERE id = ?";
        $headerStmt = $conn->prepare($headerSql);
        $headerStmt->bind_param("i", $page['header_id']);
        $headerStmt->execute();
        $headerResult = $headerStmt->get_result();
        $header = $headerResult->num_rows > 0 ? $headerResult->fetch_assoc() : null;

        // footers tablosundan verileri çek
        $footerSql = "SELECT * FROM footers WHERE id = ?";
        $footerStmt = $conn->prepare($footerSql);
        $footerStmt->bind_param("i", $page['footer_id']);
        $footerStmt->execute();
        $footerResult = $footerStmt->get_result();
        $footer = $footerResult->num_rows > 0 ? $footerResult->fetch_assoc() : null;

        // Sonuçları birleştir
        $page['header'] = $header;
        $page['footer'] = $footer;

        echo json_encode($page);
    } else {
        sendResponse(404, 'Page not found');
    }
}


function createPage($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['page_title']) || !isset($data['content']) || !isset($data['page_link'])) {
        sendResponse(400, 'Missing required fields');
    }

    // SQL sorgusunu hazırla
    $sql = "INSERT INTO pages (page_title, content, page_link, header_id, footer_id, meta_key, css, js)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiiiss", $data['page_title'], $data['content'], $data['page_link'], $data['header_id'], $data['footer_id'], $data['meta_key'], $data['css'], $data['js']);

    // Sorguyu çalıştır ve sonucu kontrol et
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
    if (!isset($data['id']) || !isset($data['page_title']) || !isset($data['content']) || !isset($data['page_link'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }
    echo $data['meta_key'];
    // SQL sorgusunu hazırla
    $sql = "UPDATE pages SET page_title=?, content=?, page_link=?, header_id=?, footer_id=?, meta_key=?, css=?, js=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiisssi", $data['page_title'], $data['content'], $data['page_link'], $data['header_id'], $data['footer_id'], $data['meta_key'], $data['css'], $data['js'], $data['id']);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(200, 'Page updated successfully');
    } else {
        sendResponse(500, 'Error updating page: ' . $stmt->error);
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