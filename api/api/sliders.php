<?php

require('connect.php');

header('Content-Type: application/json');
// date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla

function sendResponse($status, $message) {
    http_response_code($status);
    echo json_encode(["message" => $message]);
    exit();
}

function getList($conn) {
    $sql = "SELECT * FROM tab_product_sliders";
            
    $result = $conn->query($sql);

    $sliders = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $sliders[] = $row;
        }
    }

    echo json_encode($sliders);
}

function getDetail($conn, $id) {
    // sliders tablosundan verileri çek
    $sql = "SELECT * FROM tab_product_sliders WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $slider = $result->fetch_assoc();
        echo json_encode($slider);
    } else {
        sendResponse(404, 'Slider not found');
    }
}

function getDetailTab_tabs($conn, $id) {
    $sql = "SELECT id, name, show_tab_name FROM tab_product_slider_tabs WHERE slider_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    $tabs = array();
    while ($tab = $result->fetch_assoc()) {
        $tab_id = $tab['id'];
        $product_sql = "SELECT * FROM tab_product_slider_products WHERE tab_id = ?";
        $product_stmt = $conn->prepare($product_sql);
        $product_stmt->bind_param("i", $tab_id);
        $product_stmt->execute();
        $product_result = $product_stmt->get_result();

        $products = array();
        while ($product = $product_result->fetch_assoc()) {
            $products[] = $product;
        }

        $tab['products'] = $products;
        $tabs[] = $tab;
    }

    if (!empty($tabs)) {
        echo json_encode($tabs);
    } else {
        sendResponse(404, 'Page not found');
    }
}




function createSlider($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['title']) || !isset($data['tabs'])) {
        sendResponse(400, 'Missing required fields');
          return;
    }

    // SQL sorgusunu hazırla ve slider'ı ekle
    $sql = "INSERT INTO tab_product_sliders (name) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['title']);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        // Yeni oluşturulan slider'ın ID'sini al
        $slider_id = $stmt->insert_id;
        
        foreach ($data['tabs'] as $tab) {
            // İkinci tabloya veriler
            $sqltab = "INSERT INTO tab_product_slider_tabs (name, slider_id,show_tab_name ) VALUES (?, ?,?)";
            $stmttab = $conn->prepare($sqltab);
            $stmttab->bind_param("sii", $tab['tabName'], $slider_id , $tab['checkbox']);

            if ($stmttab->execute()) {
                // Yeni oluşturulan tab_menu ID'sini al
                $tab_id = $stmttab->insert_id;

                foreach ($tab['items'] as $product) {
                    
                    $sqlProducts = "INSERT INTO tab_product_slider_products (tab_id, product_id) VALUES (?, ?)";
                    $stmtProducts = $conn->prepare($sqlProducts);
                    $stmtProducts->bind_param("ii", $tab_id, $product);

                    if (!$stmtProducts->execute()) {
                        sendResponse(500, 'Error creating slider products: ' . $stmtProducts->error);
                    }
                }

            }else {
                sendResponse(500, 'Error creating slider menu: ' . $stmttab->error);
            }

        }

        sendResponse(200, 'Slider oluşturuldu');

        sendResponse(201, 'Slider oluşturuldu');
    } else {
        sendResponse(500, 'Error creating slider: ' . $stmt->error);
    }
}

function updateSlider($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['title']) || !isset($data['tabs']) || !isset($_GET['id'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }
    $slider_id = $_GET['id'];

    $sql = "UPDATE tab_product_sliders SET name = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $data['title'], $slider_id);

    if ($stmt->execute()) {
        $sqlDeleteProducts = "DELETE FROM tab_product_slider_products WHERE tab_id IN (SELECT id FROM tab_product_slider_tabs WHERE slider_id = ?)";
        $stmtDeleteProducts = $conn->prepare($sqlDeleteProducts);
        $stmtDeleteProducts->bind_param("i", $slider_id);
        if (!$stmtDeleteProducts->execute()) {
            sendResponse(500, 'Error deleting old products: ' . $stmtDeleteProducts->error);
            return;
        }

        $sqlDeleteTabs = "DELETE FROM tab_product_slider_tabs WHERE slider_id = ?";
        $stmtDeleteTabs = $conn->prepare($sqlDeleteTabs);
        $stmtDeleteTabs->bind_param("i", $slider_id);
        if (!$stmtDeleteTabs->execute()) {
            sendResponse(500, 'Error deleting old tabs: ' . $stmtDeleteTabs->error);
            return;
        }

        function handleTabsInsertion($tabs, $conn, $slider_id) {
            foreach ($tabs as $tab) {
                if (isset($tab['tabName']) && !empty($tab['tabName'])) {
                    $sqltab = "INSERT INTO tab_product_slider_tabs (name, slider_id , show_tab_name) VALUES (?,?,?)";
                    $stmttab = $conn->prepare($sqltab);
                    $stmttab->bind_param("sii", $tab['tabName'],  $slider_id , $tab['checkbox']);

                    if ($stmttab->execute()) {
                        $tab_id = $stmttab->insert_id;
                        foreach ($tab['items'] as $product) {
                            $sqlProducts = "INSERT INTO tab_product_slider_products (tab_id, product_id) VALUES (?, ?)";
                            $stmtProducts = $conn->prepare($sqlProducts);
                            $stmtProducts->bind_param("ii", $tab_id, $product);

                            if (!$stmtProducts->execute()) {
                                sendResponse(500, 'Error creating slider products: ' . $stmtProducts->error);
                                return;
                            }
                        }
                    } else {
                        sendResponse(500, 'Error creating slider menu: ' . $stmttab->error);
                        return;
                    }
                }
            }
        }

        handleTabsInsertion($data['tabs'], $conn, $slider_id);
        if (isset($data['tabsnew'])) {
            handleTabsInsertion($data['tabsnew'], $conn, $slider_id);
        }

        sendResponse(200, 'Slider updated successfully');

    } else {
        sendResponse(500, 'Error updating slider: ' . $stmt->error);
    }
}




// İstek türünü ve URL'yi kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        getDetail($conn, $id);
    }
    elseif (isset($_GET['slider_id'])){
                $id = intval($_GET['slider_id']);
         getDetailTab_tabs($conn, $id);
        
    }else {
        getList($conn);
    }
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_GET['id'])) {
        updateSlider($conn);
        echo(geldi);
    } else {
        createSlider($conn);
                echo(geldi);

    }
}


$conn->close();

?>
