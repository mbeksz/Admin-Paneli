<?php

require('connect.php');


header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla

function getList($conn) {
    // Şu anki toplam fiyatı alın
    $currentSql = "SELECT SUM(totalPrice) as total_price 
                   FROM order_list 
                   WHERE status = 'teslim edildi'";
    $currentResult = $conn->query($currentSql);
    $currentTotal = $currentResult->fetch_assoc()['total_price'];

    // Bu ve önceki hafta için toplam fiyatları alın
    $weekSql = "SELECT 
                    SUM(CASE WHEN create_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN totalPrice ELSE 0 END) as current_week_total_price,
                    SUM(CASE WHEN create_time >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 WEEK), INTERVAL 1 WEEK) AND create_time < DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN totalPrice ELSE 0 END) as previous_week_total_price
                FROM order_list 
                WHERE status = 'teslim edildi'";
    $weekResult = $conn->query($weekSql);
    $weekData = $weekResult->fetch_assoc();

    $currentWeekTotal = $weekData['current_week_total_price'];
    $previousWeekTotal = $weekData['previous_week_total_price'];

    // Şu anki "beklemede" olmayan siparişlerin sayısını alın
    $currentNotPendingSql = "SELECT COUNT(*) as total_count 
                             FROM order_list 
                             WHERE status <> 'beklemede'";
    $currentNotPendingResult = $conn->query($currentNotPendingSql);
    $currentNotPendingCount = $currentNotPendingResult->fetch_assoc()['total_count'];

    // Bu ve önceki hafta için "beklemede" olmayan siparişlerin sayısını alın
    $weekNotPendingSql = "SELECT 
                             COUNT(CASE WHEN create_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as current_week_orders,
                             COUNT(CASE WHEN create_time >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 WEEK), INTERVAL 1 WEEK) AND create_time < DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as previous_week_orders
                         FROM order_list 
                         WHERE status <> 'beklemede'";
    $weekNotPendingResult = $conn->query($weekNotPendingSql);
    $weekNotPendingData = $weekNotPendingResult->fetch_assoc();

    $currentWeekNotPendingCount = $weekNotPendingData['current_week_orders'];
    $previousWeekNotPendingCount = $weekNotPendingData['previous_week_orders'];
    
      $currentTotalUsersSql = "SELECT COUNT(*) as total_users 
                             FROM user_account";
    $currentTotalUsersResult = $conn->query($currentTotalUsersSql);
    $currentTotalUsers = $currentTotalUsersResult->fetch_assoc()['total_users'];

    // Bu ve önceki hafta için toplam kullanıcı sayısını alın
    $weekUserSql = "SELECT 
                        COUNT(CASE WHEN create_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as current_week_users,
                        COUNT(CASE WHEN create_time >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 WEEK), INTERVAL 1 WEEK) AND create_time < DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as previous_week_users
                    FROM user_account";
    $weekUserResult = $conn->query($weekUserSql);
    $weekUserData = $weekUserResult->fetch_assoc();

    $currentWeekUsers = $weekUserData['current_week_users'];
    $previousWeekUsers = $weekUserData['previous_week_users'];
    
       // Toplam ürün sayısını alın
    $currentTotalProductsSql = "SELECT COUNT(*) as total_products 
                                FROM products";
    $currentTotalProductsResult = $conn->query($currentTotalProductsSql);
    $currentTotalProducts = $currentTotalProductsResult->fetch_assoc()['total_products'];

    // Bu ve önceki hafta için toplam ürün sayısını alın
    $weekProductSql = "SELECT 
                          COUNT(CASE WHEN creation_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as current_week_products,
                          COUNT(CASE WHEN creation_date >= DATE_SUB(DATE_SUB(NOW(), INTERVAL 1 WEEK), INTERVAL 1 WEEK) AND creation_date < DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as previous_week_products
                      FROM products";
    $weekProductResult = $conn->query($weekProductSql);
    $weekProductData = $weekProductResult->fetch_assoc();

    $currentWeekProducts = $weekProductData['current_week_products'];
    $previousWeekProducts = $weekProductData['previous_week_products'];
    
    
    // Ürün sayısı oran hesaplaması
 if ($previousWeekProducts > 0) {
        $changeProductPercentage = (($currentWeekProducts - $previousWeekProducts) / $previousWeekProducts) * 100;
    } else {
        $changeProductPercentage = $currentWeekProducts * 100;
    }

    // Kullanıcı sayısı oran hesaplaması
    if ($previousWeekUsers > 0) {
        $changeUserPercentage = (($currentWeekUsers - $previousWeekUsers) / $previousWeekUsers) * 100;
    } else {
        $changeUserPercentage = $currentWeekUsers * 100;
    }

    // Oran hesaplaması
    if ($previousWeekTotal > 0) {
        $changePercentage = (($currentWeekTotal - $previousWeekTotal) / $previousWeekTotal) * 100;
    } else {
        $changePercentage = $currentWeekTotal * 100;
    }

    // Sipariş sayısı oran hesaplaması
    if ($previousWeekNotPendingCount > 0) {
        $changeOrderPercentage = (($currentWeekNotPendingCount - $previousWeekNotPendingCount) / $previousWeekNotPendingCount) * 100;
    } else {
        $changeOrderPercentage = $currentWeekNotPendingCount * 100;
    }

    // JSON çıktısı
    $output = [
        'current_total_price' => $currentTotal,
        'current_week_total_price' => $currentWeekTotal,
        'previous_week_total_price' => $previousWeekTotal,
        'change_percentage' => $changePercentage,
        'change_order_percentage' => $changeOrderPercentage,
        'current_total_orders_count' => $currentNotPendingCount,
        'current_week_orders' => $currentWeekNotPendingCount,
        'previous_week_orders' => $previousWeekNotPendingCount,
         'current_total_users' => $currentTotalUsers,
        'current_week_users' => $currentWeekUsers,
        'previous_week_users' => $previousWeekUsers,
        'change_user_percentage' => $changeUserPercentage,
          'current_total_products' => $currentTotalProducts,
        'current_week_products' => $currentWeekProducts,
        'previous_week_products' => $previousWeekProducts,
        'change_product_percentage' => $changeProductPercentage
    ];

    echo json_encode($output);
}




// İstek türünü ve URL'yi kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    getList($conn);
}

$conn->close();


?>