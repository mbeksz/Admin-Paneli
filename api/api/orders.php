<?php

require('connect.php');
include('../../stylist/mail.php');

header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); 

function getList($conn) {
    // Tüm siparişleri seçen SQL sorgusu
    $sql = "SELECT * FROM order_list";
    $result = $conn->query($sql);

    // Sipariş verilerini saklamak için dizi
    $orders = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }

    // Toplam sipariş
    $orderCount = count($orders);

    // Beklemede olan siparişler
    $pendingSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'beklemede'";
    $pendingResult = $conn->query($pendingSql);
    $pendingCount = $pendingResult->fetch_assoc()['count'];

    // Onaylanan siparişler
    $approvedSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'onaylandı'";
    $approvedResult = $conn->query($approvedSql);
    $approvedCount = $approvedResult->fetch_assoc()['count'];

    // Onaylanmayan siparişler
    $notApprovedSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'onaylanmadı'";
    $notApprovedResult = $conn->query($notApprovedSql);
    $notApprovedCount = $notApprovedResult->fetch_assoc()['count'];

    // İptal edilen siparişler
    $cancelledSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'iptal edildi'";
    $cancelledResult = $conn->query($cancelledSql);
    $cancelledCount = $cancelledResult->fetch_assoc()['count'];

    // Kargoya verilen siparişler
    $shipSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'kargoya verildi'";
    $shipResult = $conn->query($shipSql);
    $shipCount = $shipResult->fetch_assoc()['count'];
    
    // Teslim edilen siparişler
    $deliveredSql = "SELECT COUNT(*) as count FROM order_list WHERE status = 'teslim edildi'";
    $deliveredResult = $conn->query($deliveredSql);
    $deliveredCount = $deliveredResult->fetch_assoc()['count'];

    $response = [
        'order_count' => $orderCount,
        'pending_count' => $pendingCount,
        'approved_count' => $approvedCount,
        'not_approved_count' => $notApprovedCount,
        'cancelled_count' => $cancelledCount,
        'ship_count' => $shipCount,
        'delivered_count' => $deliveredCount,
        'orders' => $orders
    ];

    echo json_encode($response);
}


function getDetail($conn, $id) {
    // Fetch data from order_list table
    $sql = "SELECT * FROM order_list WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    $response = [];

    if ($result->num_rows > 0) {
        $page = $result->fetch_assoc();
        $response['page'] = $page;
    } else {
        $response['error'] = 'Page not found';
    }
    $stmt->close();

    // Fetch data from options table
    $sqloptions = "SELECT * FROM options";
    $stmt = $conn->prepare($sqloptions);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $options = [];
        while ($row = $result->fetch_assoc()) {
            $options[$row['name']] = $row['value'];
        }
        $response['options'] = $options;
    } else {
        $response['options'] = [];
    }
    $stmt->close();

    // Fetch order items and product titles
    $sqlItems = "SELECT 
                    oi.quantity,
                    oi.product_id,
                    oi.order_id,
                    p.title AS product_title, 
                    p.unit_price,
                    p.discount
                 FROM 
                    order_items oi
                 INNER JOIN 
                    products p ON oi.product_id = p.id
                 WHERE 
                    oi.order_id = ?";
    $stmt = $conn->prepare($sqlItems);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $productId = $row['product_id'];
         $orderId = $row['order_id'];
        $discounted_unit_price = $row['unit_price'] * (1 - $row['discount'] / 100);
        $discounted_unit_price_formatted = number_format($discounted_unit_price, 2, '.', '');
        $items[$productId] = [
            'quantity' => $row['quantity'],
            'product_title' => $row['product_title'],
            'unit_price' => $row['unit_price'],
            'discounted_unit_price' => $discounted_unit_price_formatted, // Include formatted discounted price
            'discount' => $row['discount'],
            'variations' => [],
            'attributes' => []
        ];
    }
}

    $stmt->close();

    foreach ($items as $productId => &$item) {
        $sqlVarAttr = "SELECT 
                          ov.variation_id, 
                          ov.attribute_id, 
                          v.name AS variation_name, 
                          a.name AS attribute_name
                       FROM 
                          order_variations ov
                       INNER JOIN 
                          variations v ON ov.variation_id = v.id
                       INNER JOIN 
                          attributes a ON ov.attribute_id = a.id
                       WHERE 
                          ov.order_id = ? and ov.product_id = ?";
        $stmt = $conn->prepare($sqlVarAttr);
        $stmt->bind_param("ii", $orderId,$productId);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            if ($row['variation_name']) {
                array_push($item['variations'], ['id' => $row['variation_id'], 'value' => $row['variation_name']]);
            }

            if ($row['attribute_name']) {
                array_push($item['attributes'], ['id' => $row['attribute_id'], 'value' => $row['attribute_name']]);
            }
        }
        $stmt->close();
    }

    // Calculate prices and discounts based on variations and attributes
    foreach ($items as $productId => &$item) {
        $unit_price = 0;
        $total_discounted_price = 0;
        $total_discount_amount = 0;

        foreach ($item['variations'] as $variation) {
            foreach ($item['attributes'] as $attribute) {
                $variationId = $variation['id'];
                $attributeId = $attribute['id'];

                $query = "SELECT 
                            unit_price, 
                            discount 
                          FROM 
                            products 
                          WHERE 
                            parent_product = ? 
                            AND variation_id = ? 
                            AND attribute_id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("iii", $productId, $variationId, $attributeId);
                $stmt->execute();
                $variationResult = $stmt->get_result();

                if ($variationRow = $variationResult->fetch_assoc()) {
                    $current_unit_price = $variationRow['unit_price'];
                    $discount = $variationRow['discount'];
                    $discounted_unit_price = $current_unit_price * (1 - $discount / 100);
                    $discounted_total_price = $discounted_unit_price * $item['quantity'];
                    $discount_amount = $current_unit_price * $item['quantity'] * ($discount / 100);

                    $unit_price += $discounted_unit_price;
                    $total_discounted_price += $discounted_total_price;
                    $total_discount_amount += $discount_amount;
                }

                $stmt->close();
            }
        }

        $item['variation_unit_discounted_price'] = number_format($unit_price, 2, ',', '');
        $item['variation_total_discounted_price'] = number_format($total_discounted_price, 2, ',', '');
        $item['variation_total_discount_amount'] = number_format($total_discount_amount, 2, ',', '');
    }

    $response['order_items'] = $items;

    echo json_encode($response);
}



function updateOrderStatus($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['status']) || !isset($data['id'])) {
        sendResponse(400, 'Eksik veri');
        return;
    }

    $status = $data['status'];
    $order_id = intval($data['id']);

    // SQL sorgusunu hazırla
    $sql = "UPDATE order_list SET status=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $order_id);

    // Sorguyu çalıştır ve sonucu kontrol et
    if ($stmt->execute()) {
        $email = null;
        sendResponse(200, 'Order status updated successfully');

        $email_sql = "SELECT email FROM order_list WHERE id=?";
        $email_stmt = $conn->prepare($email_sql);
        $email_stmt->bind_param("i", $order_id);
        $email_stmt->execute();
        $email_stmt->bind_result($email);
        $email_stmt->fetch();
        $email_stmt->close();

        $subject = '';
        $messageOrderReceived = '';

        if ($status == "iptal edildi") {
            $subject = 'Siparişiniz İptal Edildi!';
            echo "Siparisiniz Iptal Edildi";
        } elseif ($status == "onaylanmadı") {
            $subject = 'Siparişiniz onaylanmadı!';
            echo "Siparisiniz onaylanmadı";
        } elseif ($status == "teslim edildi") {
            $subject = 'Siparişiniz teslim edildi!';
                        echo "Siparisiniz teslim edildi";
        }  elseif ($status == "onaylandı") {
        $subject = 'Siparişiniz onaylandı!';
            echo "Siparisiniz Onaylandı";
        }
        // $messageOrderReceived = getOrderStatusContent($status, $order_id);

        $postData = [
            'to' => "customermailtest@example.com.tr",
            'subject' => ' | '. $subject,
            'message' => $messageOrderReceived,
            'from' => 'customermailtest@example.com.tr',
            'name' => '',
        ];

        $ch = curl_init( '/api/mail.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

            $response = curl_exec($ch);

        if ($response === false) {
            echo "cURL Error: " . curl_error($ch);
        } else {
            echo "response içeriği " . $response;
        }
        curl_close($ch);

    } else {
        sendResponse(500, 'Error updating order status: ' . $stmt->error);
    }

    $stmt->close();
}




function sendResponse($status_code, $message) {
    http_response_code($status_code);
    echo json_encode(['message' => $message]);
}

function createOrder($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['page_title']) || !isset($data['content'])) {
        sendResponse(400, 'Missing required fields');
        return;
    }
    $stmt = $conn->prepare("INSERT INTO order_list (title, content) VALUES (?, ?)");
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
        updateOrderStatus($conn);
    } else {
        createOrder($conn);

    }
}


$conn->close();


?>