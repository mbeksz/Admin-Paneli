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
    $sql = "SELECT * from menu_container";
            
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

function createMenu($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['page_title']) || !isset($data['menuData'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }

    $sqlContainer = "INSERT INTO menu_container (name) VALUES (?)";
    $stmtContainer = $conn->prepare($sqlContainer);
    
    if (!$stmtContainer) {
        sendResponse(500, 'Database error: ' . $conn->error);
        return;
    }
    
    $stmtContainer->bind_param("s", $data['page_title']);
    
    if (!$stmtContainer->execute()) {
        sendResponse(500, 'Error creating page: ' . $stmtContainer->error);
        return;
    }
    
    $container_id = $stmtContainer->insert_id;
    
    foreach ($data['menuData'] as $menuItem) {
        $menuName = $menuItem['menuName'];
        $menuDescription = isset($menuItem['menuDescription']) ? $menuItem['menuDescription'] : '';
        $site_url = isset($menuItem['site_url']) ? $menuItem['site_url'] : '';
        
        if (!empty($site_url) && $site_url !== 'null') {
            $sqlMenu = "INSERT INTO menu (container_id, name, sub_page_url, site_url) VALUES (?, ?, ?, ?)";
            $stmtMenu = $conn->prepare($sqlMenu);
            if (!$stmtMenu) {
                sendResponse(500, 'Database error: ' . $conn->error);
                return;
            }
            $stmtMenu->bind_param("isss", $container_id, $menuName, $menuDescription, $site_url);
        } else {
            $pageSelection = $menuItem['pageSelection'];
            $sqlMenu = "INSERT INTO menu (container_id, name, page_id, sub_page_url) VALUES (?, ?, ?, ?)";
            $stmtMenu = $conn->prepare($sqlMenu);
            if (!$stmtMenu) {
                sendResponse(500, 'Database error: ' . $conn->error);
                return;
            }
            $stmtMenu->bind_param("isis", $container_id, $menuName, $pageSelection, $menuDescription);
        }
        
        if (!$stmtMenu->execute()) {
            sendResponse(500, 'Error creating menu: ' . $stmtMenu->error);
            return;
        }
    }

    sendResponse(201, 'Menu and page created successfully');
}



function updateMenu($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['page_title']) || !isset($data['menuData']) || !isset($data['page_id'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }
    
    $page_title = $data['page_title'];
    $page_id = $data['page_id'];
    $menuData = $data['menuData'];

    // Örnek olarak menü verilerini ekrana yazdır
    echo 'Page Title: ' . $page_title . '<br>';
    echo 'Menu Data:<br>';
    foreach ($menuData as $menu) {
        echo 'Menu Name: ' . $menu['menuName'] . ', Description: ' . $menu['menuDescription'] . ', Page Selection: ' . $menu['pageSelection'] . '<br>';
    }

    $updateSql = "UPDATE menu_container SET name = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    if ($updateStmt === false) {
        sendResponse(500, 'Error preparing update statement');
        return;
    }
    $updateStmt->bind_param("si", $page_title, $page_id);
    if (!$updateStmt->execute()) {
        sendResponse(500, 'Error updating page: ' . $updateStmt->error);
        return;
    }

    $deleteSql = "DELETE FROM menu WHERE container_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    if ($deleteStmt === false) {
        sendResponse(500, 'Error preparing delete statement');
        return;
    }
    $deleteStmt->bind_param("i", $page_id);
    if (!$deleteStmt->execute()) {
        sendResponse(500, 'Error deleting menus: ' . $deleteStmt->error);
        return;
    }

   // Yeni menüleri ekle
foreach ($menuData as $menu) {
    // $menu['site_url'] değeri dolu ve 'null' değilse
    if (!empty($menu['site_url']) && $menu['site_url'] !== 'null') {
        $insertSql = "INSERT INTO menu (container_id, name, sub_page_url, site_url, page_id) VALUES (?, ?, ?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        if ($insertStmt === false) {
            sendResponse(500, 'Error preparing insert statement');
            return;
        }
        // 'page_id' parametresi de ekleniyor
        $insertStmt->bind_param("isssi", $page_id, $menu['menuName'], $menu['menuDescription'], $menu['site_url'], $menu['pageSelection']);
        if (!$insertStmt->execute()) {
            sendResponse(500, 'Error inserting menu: ' . $insertStmt->error);
            return;
        }
    } else {
        $insertSql = "INSERT INTO menu (container_id, name, sub_page_url, page_id) VALUES (?, ?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        if ($insertStmt === false) {
            sendResponse(500, 'Error preparing insert statement');
            return;
        }
        // 'page_id' parametresi burada da ekleniyor
        $insertStmt->bind_param("issi", $page_id, $menu['menuName'], $menu['menuDescription'], $menu['pageSelection']);
        if (!$insertStmt->execute()) {
            sendResponse(500, 'Error inserting menu: ' . $insertStmt->error);
            return;
        }
    }
}



    sendResponse(201, 'Page updated successfully');
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
        updateMenu($conn);
        echo("geldi");
    } else {
        createMenu($conn);
    }
}


$conn->close();


?>