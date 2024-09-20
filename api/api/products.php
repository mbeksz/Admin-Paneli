<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require('connect.php');


header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla


function sendResponse($status, $message, $data) {
    http_response_code($status);
    echo json_encode(["message" => $message, "data" => $data]);
    exit();
}

function getList($conn) {
    $sql = "SELECT 
                p.id, 
                p.parent_product, 
                p.cover_photo_id, 
                CONCAT(o.value, 'media/', m.file_name, '.', m.file_extension) AS cover_image, 
                p.title, 
                p.category_id, 
                c.name AS category, 
                p.unit_price, 
                p.update_date AS update_date, 
                p.discount, 
                p.discount_type, 
                p.stock, 
                p.stock_type,
                COUNT(oo.product_id) AS order_count
            FROM 
                products p
            LEFT JOIN 
                media m ON p.cover_photo_id = m.id
            LEFT JOIN 
                categories c ON p.category_id = c.id
            LEFT JOIN 
                options o ON o.name = 'site_path'
            LEFT JOIN 
                order_items oo ON p.id = oo.product_id  -- order tablosunu product tablosu ile birleştir
            WHERE 
                p.parent_product IS NULL
            GROUP BY 
                p.id, 
                p.parent_product, 
                p.cover_photo_id, 
                cover_image, 
                p.title, 
                p.category_id, 
                category, 
                p.unit_price, 
                update_date, 
                p.discount, 
                p.discount_type, 
                p.stock, 
                p.stock_type
            ORDER BY 
                p.id DESC;

            ";
            
    $result = $conn->query($sql);

    $pages = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $row['update_date'] = date('Y-m-d H:i:s', strtotime($row['update_date']));
            $pages[] = $row;
        }
    }

    echo json_encode($pages);
}

// Ürün detaylarını al
function getDetail($conn, $productId) {
    // Ana ürün bilgilerini al
$sql = "
    SELECT 
        p.id, 
        p.parent_product, 
        p.cover_photo_id, 
        CONCAT('/media/', m.file_name, '.', m.file_extension) AS cover_image, 
        p.hover_photo_id, 
        CONCAT('/media/', hm.file_name, '.', hm.file_extension) AS hover_image,
        p.title, 
        p.sentence, 
        p.youtube_url, 
        p.link, 
        p.content, 
        p.category_id, 
        c.name AS category, 
        p.unit_price AS price, 
        p.discount, 
        p.discount_type, 
        p.stock, 
        p.stock_type, 
        p.short_description AS description, 
        p.meta_tags AS tags, 
        p.update_date AS update_date 
    FROM 
        products p
    LEFT JOIN 
        media m ON p.cover_photo_id = m.id
    LEFT JOIN 
        media hm ON p.hover_photo_id = hm.id
    LEFT JOIN 
        categories c ON p.category_id = c.id
    WHERE 
        p.id = ?";


    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(404, 'Product not found');
    }

    $product = $result->fetch_assoc();

// Ürüne ait resimleri al
$sql = "
    SELECT 
        pi.media_id as id, 
        CONCAT('/media/', m.file_name, '.', m.file_extension) AS image_url,
        m.file_name
    FROM 
        product_images pi
    LEFT JOIN 
        media m ON pi.media_id = m.id
    WHERE 
        pi.product_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $productId);
$stmt->execute();
$result = $stmt->get_result();
$images = [];
while ($row = $result->fetch_assoc()) {
    $images[] = [
        'id' => $row['id'],
        'folder_path' => $row['image_url'],
        'name' => $row['file_name']
    ];
}


    $product['images'] = $images;

    // Ürüne ait varyasyonları al
    $sql = "
    SELECT 
        v.name AS variation_name, 
        a.name AS attribute_name, 
        pv.discount AS discount, 
        pv.unit_price AS price, 
        pv.content AS content, 
        pv.stock AS stock 
    FROM 
        products pv
    LEFT JOIN 
        variations v ON pv.variation_id = v.id
    LEFT JOIN 
        attributes a ON pv.attribute_id = a.id
    WHERE 
        pv.parent_product = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $variations = [];
    while ($row = $result->fetch_assoc()) {
        $variations[] = $row;
    }
    $product['variations'] = $variations;
    
    $sql = "
    SELECT 
        title, 
        content, 
        order_no AS `order`
    FROM 
        product_dropdown
    WHERE 
        product_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $productId);
$stmt->execute();
$result = $stmt->get_result();
$dropdowns = [];
while ($row = $result->fetch_assoc()) {
    $dropdowns[] = $row;
}

$product['dropdowns'] = $dropdowns;




    $sql = "
    SELECT 
        product_id,
        recommendation_type
    FROM 
        product_recommendations
    WHERE 
        parent_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $recommendations = [];
    while ($row = $result->fetch_assoc()) {
        $recommendations[] = $row;
    }

    $product['recommendations'] = $recommendations;

    sendResponse(200, 'Product details retrieved successfully', $product);
}


function getOrCreateCategory($conn, $name)
{
    // Virgülle ayrılmışsa, her bir ismi al
    $names = explode(',', $name);
    $names = array_map('trim', $names); // Boşlukları temizle

    // Kategorilerin ID'lerini saklayacağımız dizi
    $categoryIds = [];

    foreach ($names as $name) {
        // Kategori adını küçük harfe dönüştürerek arama yap
        $lowerName = strtolower($name);

        // Kategoriyi kontrol etmek için SQL sorgusu
        $sql = "SELECT id, name FROM categories WHERE LOWER(name) = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            sendResponse(500, 'Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("s", $lowerName);
        $stmt->execute();
        $stmt->store_result();

        // Eğer kategori varsa ID'yi döndür
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($id, $storedName);
            $stmt->fetch();
            $stmt->close();
            $categoryIds[] = $id;
        } else {
            // Kategori yoksa, yeni kategori ekle
            $stmt->close();
            $sql = "INSERT INTO categories (name) VALUES (?)";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                sendResponse(500, 'Prepare failed: ' . $conn->error);
            }
            // Kategori adını büyük harfle kaydet
            $stmt->bind_param("s", ucfirst($name));
            if ($stmt->execute()) {
                $insertId = $stmt->insert_id;
                $stmt->close();
                $categoryIds[] = $insertId;
            } else {
                $stmt->close();
                sendResponse(500, 'Error creating category: ' . $stmt->error);
            }
        }
    }

    // ID'leri virgülle ayırarak döndür
    return implode(',', $categoryIds);
}




function createProduct($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['title']) || !isset($data['link']) || !isset($data['price'])) {
        sendResponse(400, 'Missing required fields');
    }
    
  if (!empty($data['new_category'])) {
    $data['category_ids'] = getOrCreateCategory($conn, $data['new_category']);
}


    
    $sql = "INSERT INTO products (cover_photo_id, hover_photo_id, title, link, content, category_id, unit_price, short_description, discount, stock, meta_tags, sentence, youtube_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";
    $stmt = $conn->prepare($sql);
    
    $discount = $data['discount']==='0'?null:$data['discount'];
    
    $stmt->bind_param("iissssssdisss", 
        $data['cover_image'], 
        $data['hover_image'], 
        $data['title'], 
        $data['link'], 
        $data['content'], 
        $data['category_ids'], 
        $data['price'], 
        $data['desc'], 
        $discount, 
        $data['stock'], 
        $data['tags'],
        $data['sentence'],
        $data['youtube_url']

    );

    if ($stmt->execute()) {
        
        
        
        $productId = $stmt->insert_id;
        // Resimleri ekle
        if (!empty($data['images'])) {
            addProductImages($conn, $productId, $data['images']);
        }
        
        // Varyasyonları ekle
        if (!empty($data['variations'])) {
            addProductVariations2($conn, $productId, $data['variations']);
        }
        
         // dropdowna ekle
        if (!empty($data['dropdowns'])) {
            addProductDropdowns($conn, $productId, $data['dropdowns']);
        }
        
        sendResponse(201, 'Product created successfully', ['id' => $productId]);

    } else {
        sendResponse(500, 'Error creating product: ' . $stmt->error);
    }
}

function updateProduct($conn) {
    // JSON verisini oku
    $data = json_decode(file_get_contents('php://input'), true);

    // Gerekli alanları kontrol et
    if (!isset($data['id']) || !isset($data['title']) || !isset($data['link'])) {
        sendResponse(400, 'Missing required fields');
    }
    
    $all_category_ids =  $data['category_ids'];
    
      if (!empty($data['new_category'])) {
   $new_category_id = getOrCreateCategory($conn, $data['new_category']);
   
   $all_category_ids.= ',' . $new_category_id;
   
}

    // Ürün detaylarını güncelle
    $sql = "UPDATE products SET 
                cover_photo_id = ?, 
                sentence = ?, 
                youtube_url = ?, 
                hover_photo_id = ?, 
                title = ?, 
                link = ?, 
                content = ?, 
                category_id = ?, 
                unit_price = ?, 
                short_description = ?, 
                discount = ?, 
                stock = ?,
                meta_tags = ? 
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ississssisdisi", 
        $data['cover_image'], 
        $data['sentence'], 
        $data['youtube_url'], 
        $data['hover_image'], 
        $data['title'], 
        $data['link'], 
        $data['content'], 
        $all_category_ids, 
        $data['price'], 
        $data['desc'], 
        $data['discount'], 
        $data['stock'], 
        $data['tags'],
        $data['id']
    );

    if (!$stmt->execute()) {
        sendResponse(500, 'Error updating product: ' . $stmt->error);
    }

    // Ürüne ait eski resimleri sil
    $sql = "DELETE FROM product_images WHERE product_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['id']);
    if (!$stmt->execute()) {
        sendResponse(500, 'Error deleting product images: ' . $stmt->error);
    }

    // Resimleri ekle
    if (!empty($data['images'])) {
        addProductImages($conn, $data['id'], $data['images']);
    }

    // Eski varyasyonları sil
    $sql = "DELETE FROM products WHERE parent_product = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['id']);
    if (!$stmt->execute()) {
        sendResponse(500, 'Error deleting product variations: ' . $stmt->error);
    }
    
    // Eski dropdownları sil
    $sql = "DELETE FROM product_dropdown WHERE product_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['id']);
    if (!$stmt->execute()) {
        sendResponse(500, 'Error deleting product dropdowns. ' . $stmt->error);
    }
    
    // Eski ürün önermelerini sil
    $sql = "DELETE FROM product_recommendations WHERE parent_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $data['id']);
    if (!$stmt->execute()) {
        sendResponse(500, 'Error deleting product recommendations: ' . $stmt->error);
    }
    
    addProductRecommendations($conn,$data['id'],$data['similarProducts'],$data['relatedProducts']);

     // Varyasyonları ekle
     if (!empty($data['variations'])) {
        addProductVariations2($conn, $data['id'], $data['variations']);
    }
         // Dropdownları ekle

     if (!empty($data['dropdowns'])) {
        addProductDropdowns($conn, $data['id'], $data['dropdowns']);
    }
    
    sendResponse(201, 'Product update successfully', ['id' => $data['id']]);

}


// Resimleri ekle
function addProductImages($conn, $productId, $images) {
    $sql = "INSERT INTO product_images (product_id, media_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    foreach ($images as $imageId) {
        $stmt->bind_param("ii", $productId, $imageId);
        if (!$stmt->execute()) {
            sendResponse(500, 'Error adding product images: ' . $stmt->error);
        }
    }
}


// Benzer ürün ekle
function addProductRecommendations($conn, $productId, $similarProducts, $relatedProducts) {
    foreach ($similarProducts as $similar) {
        // Benzer ürün ekle
        $sql = "INSERT INTO product_recommendations (parent_id, product_id, recommendation_type) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $recommendationType = 'similar';
        $stmt->bind_param("iis", $productId, $similar, $recommendationType);
        if (!$stmt->execute()) {
            sendResponse(500, 'Error adding product product_recommendations similar: ' . $stmt->error);
        }
    }
    
    foreach ($relatedProducts as $related) {
        // İlgili ürün ekle
        $sql = "INSERT INTO product_recommendations (parent_id, product_id, recommendation_type) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $recommendationType = 'related';
        $stmt->bind_param("iis", $productId, $related, $recommendationType);
        if (!$stmt->execute()) {
            sendResponse(500, 'Error adding product product_recommendations related: ' . $stmt->error);
        }
    }
}


// Varyasyonları ekle
function addProductVariations($conn, $productId, $variations) {
    foreach ($variations as $variation) {
        // Varyasyonu kontrol et
        $variationId = getOrCreateVariation($conn, $variation['variation_name']);
        // Özelliği kontrol et
        $attributeId = getOrCreateAttribute($conn, $variationId, $variation['attribute_name']);

        // Varyasyonu ekle
        $sql = "INSERT INTO products (parent_product, variation_id, attribute_id, discount, unit_price, stock,content) VALUES (?, ?, ?, ?, ?, ?,?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiiiiis", $productId, $variationId, $attributeId, $variation['discount'], $variation['price'], $variation['stock'],$variation['content']);
        if (!$stmt->execute()) {
            sendResponse(500, 'Error adding product variations: ' . $stmt->error);
        }
    }
}

function addProductVariations2($conn, $productId, $variations) {
    foreach ($variations as $variation) {
        if (empty($variation['variation_name'])) {
            sendResponse(400, 'Variation name is required.');
            return;  
        }

        if (!isset($variation['attributes']) || !is_array($variation['attributes'])) {
            sendResponse(400, 'Attributes are required and must be an array.');
            return;  
        }


        $variationId = getOrCreateVariation2($conn, $variation['variation_name']);
        if (!$variationId) {
            sendResponse(500, 'Error getting or creating variation.');
            return;  
        }


        foreach ($variation['attributes'] as $attribute) {
            if (empty($attribute['attribute_name'])) {
                sendResponse(400, 'Attribute name is required.');
                return;  
            }


            $attributeId = getOrCreateAttribute2($conn, $variationId, $attribute['attribute_name']);
            if (!$attributeId) {
                sendResponse(500, 'Error getting or creating attribute.');
                return;  
            }

            // Insert the variation
            $sql = "INSERT INTO products (parent_product, variation_id, attribute_id, discount, unit_price, stock, content) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                sendResponse(500, 'Error preparing statement: ' . $conn->error);
                return;  
            }
            
            $stmt->bind_param("iiidiis", $productId, $variationId, $attributeId, $attribute['discount'], $attribute['price'], $attribute['stock'], $attribute['content']);
            
            if (!$stmt->execute()) {
                sendResponse(500, 'Error adding product variations: ' . $stmt->error);
                $stmt->close();  
                return; 
            }

            $stmt->close();  
        }
    }

}


function getOrCreateVariation2($conn, $name) {
    $sql = "SELECT id FROM variations WHERE name = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        sendResponse(500, 'Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id);
        $stmt->fetch();
        $stmt->close();   
        return $id;
    } else {
        $stmt->close();   
        $sql = "INSERT INTO variations (name) VALUES (?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            sendResponse(500, 'Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("s", $name);
        if ($stmt->execute()) {
            $insertId = $stmt->insert_id;
            $stmt->close();
            return $insertId;
        } else {
            $stmt->close();
            sendResponse(500, 'Error creating variation: ' . $stmt->error);
        }
    }
}

function getOrCreateAttribute2($conn, $variation_id, $name) {
    $sql = "SELECT id FROM attributes WHERE name = ? AND variation_id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        sendResponse(500, 'Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param("si", $name, $variation_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id);
        $stmt->fetch();
        $stmt->close();   
        return $id;
    } else {
        $stmt->close();  
        $sql = "INSERT INTO attributes (name, variation_id) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            sendResponse(500, 'Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("si", $name, $variation_id);
        if ($stmt->execute()) {
            $insertId = $stmt->insert_id;
            $stmt->close();
            return $insertId;
        } else {
            $stmt->close();
            sendResponse(500, 'Error creating attribute: ' . $stmt->error);
        }
    }
}


function addProductDropdowns($conn, $productId, $dropdowns) {
    if (!$conn) {
        die('Veritabanı bağlantısı başarısız');
    }

    foreach ($dropdowns as $dropdown) {
        $productId = (int)$productId;
        $order = isset($dropdown['order']) ? (int)$dropdown['order'] : 0;  

        $title = $conn->real_escape_string($dropdown['title']);
        $content = $conn->real_escape_string($dropdown['content']);

        // SQL sorgusunu hazırla
        $query = "INSERT INTO product_dropdown (product_id, title, content, order_no) VALUES ('$productId', '$title', '$content', '$order')";

        // Sorguyu çalıştır
        if (!$conn->query($query)) {
            echo "Error: " . $conn->error;
        }
    }
}


// Varyasyon kontrolü ve ekleme
function getOrCreateVariation($conn, $name) {
    $sql = "SELECT id FROM variations WHERE name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id);
        $stmt->fetch();
        return $id;
    } else {
        $sql = "INSERT INTO variations (name) VALUES (?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $name);
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            sendResponse(500, 'Error creating variation: ' . $stmt->error);
        }
    }
}

// Özellik kontrolü ve ekleme
function getOrCreateAttribute($conn, $variation_id, $name) {
    $sql = "SELECT id FROM attributes WHERE name = ? AND variation_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $name, $variation_id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id);
        $stmt->fetch();
        return $id;
    } else {
        $sql = "INSERT INTO attributes (name, variation_id) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $name, $variation_id);
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            sendResponse(500, 'Error creating attribute: ' . $stmt->error);
        }
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
        updateProduct($conn);
    } else {
        createProduct($conn);
    }
}



$conn->close();


?>