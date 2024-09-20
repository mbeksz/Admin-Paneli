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
    $sql = "SELECT * from categories";
            
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
    $sqlContainer = "SELECT * FROM menu_container WHERE id = ?";
    $stmtContainer = $conn->prepare($sqlContainer);
    $stmtContainer->bind_param("i", $id);
    $stmtContainer->execute();
    $resultContainer = $stmtContainer->get_result();

    if ($resultContainer->num_rows > 0) {
        $menuContainer = $resultContainer->fetch_assoc();
        $title = $menuContainer['name'];
        $menuContainer['menus'] = array(); 
        
        $sqlMenu = "SELECT * FROM menu WHERE container_id = ?";
        $stmtMenu = $conn->prepare($sqlMenu);
        $stmtMenu->bind_param("i", $id);
        $stmtMenu->execute();
        $resultMenu = $stmtMenu->get_result();

        while ($menuItem = $resultMenu->fetch_assoc()) {
            $menuContainer['menus'][] = $menuItem;
        }

        echo json_encode($menuContainer);
    } else {
        sendResponse(404, 'Menu container not found');
    }
}

function createCategory($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['categoryTitle']) || !isset($data['url']) || !isset($data['name'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    $name = $data['name'];
    $url = $data['url'];
    $categoryTitle = $data['categoryTitle'];
    $parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;

    $sqlCategories = "INSERT INTO categories (name, url, title, parent_id) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sqlCategories);

    if ($stmt === false) {
        sendResponse(500, 'Database preparation error: ' . $conn->error);
        return;
    }

    if ($parent_id !== null) {
        $stmt->bind_param("sssi", $name, $url, $categoryTitle, $parent_id);
    } else {
        $stmt->bind_param("sss", $name, $url, $categoryTitle);
    }

    if ($stmt->execute()) {
        sendResponse(201, 'Category created successfully');
    } else {
        sendResponse(500, 'Error creating category: ' . $stmt->error);
    }
}




function updateCategory($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
echo("geldi");

    // Gerekli alanların varlığını kontrol et
    if (!isset($data['categoryTitle']) || !isset($data['url']) || !isset($data['name'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }
    $category_id = intval($_GET['id']);
    $name = $data['name'];
    $url = $data['url'];
    $categoryTitle = $data['categoryTitle'];
    $parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;

    // Kategoriyi güncellemek için SQL sorgusu
    $sqlUpdate = "UPDATE categories SET name = ?, url = ?, title = ?, parent_id = ? WHERE id = ?";
    $stmt = $conn->prepare($sqlUpdate);

    if ($stmt === false) {
        sendResponse(500, 'Database preparation error: ' . $conn->error);
        return;
    }

    if ($parent_id !== null) {
        $stmt->bind_param("sssii", $name, $url, $categoryTitle, $parent_id, $category_id);
    } else {
        $stmt->bind_param("sssi", $name, $url, $categoryTitle, $category_id);
    }

    if ($stmt->execute()) {
        sendResponse(200, 'Category updated successfully');
    } else {
        sendResponse(500, 'Error updating category: ' . $stmt->error);
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
        updateCategory($conn);
        echo("buraya gledi");
    } else {
        createCategory($conn);
    }
}


$conn->close();


?>