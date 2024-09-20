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
    $sql = "SELECT * from instagram_posts";
            
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
            FROM instagram_posts ip
            LEFT JOIN media m ON ip.media_id = m.id
            WHERE ip.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $instagram_post = $result->fetch_assoc();
        echo json_encode($instagram_post);
    } else {
        sendResponse(404, 'Page not found');
    }
}



function createPost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['link']) || !isset($data['cover_image'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    // Log the incoming data to console (optional)
    error_log('Incoming data: ' . print_r($data, true));

    // Prepare and execute the SQL query
    $stmt = $conn->prepare("INSERT INTO instagram_posts (media_id, link) VALUES (?, ?)");
    $stmt->bind_param("ss", $data['cover_image'], $data['link']);

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
    if ( !isset($data['link']) || !isset($data['cover_image']) ) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    // SQL sorgusunu hazırla
    $sql = "UPDATE instagram_posts SET media_id=?, link=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $data['cover_image'], $data['link'], $_GET['id']);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        sendResponse(201, 'instagram_posts updated successfully');
    } else {
        sendResponse(500, 'Error updating instagram_posts: ' . $stmt->error);
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
    if (isset($_GET['instagrampostId'])) {
                $id = intval($_GET['instagrampostId']);
        deletePost($conn,$id);
    } elseif  (isset($_GET['id'])){
        updatePost($conn);
    } else {
        createPost($conn);
    }
}

function deletePost($conn, $id) {
    $sql = "DELETE FROM instagram_posts WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => 'Post deleted successfully']);
    } else {
        echo json_encode(['error' => 'Failed to delete post']);
    }
}

$conn->close();


?>