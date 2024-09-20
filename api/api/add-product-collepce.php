<?php

// Maksimum çalışma süresini 6000 saniyeye çıkar
set_time_limit(60000);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require('connect.php');
require '../../vendor/autoload.php'; // PhpSpreadsheet kütüphanesini dahil ediyoruz excel için

header('Content-Type: application/json');
date_default_timezone_set('Europe/Istanbul'); // Türkiye saat dilimine ayarla

use PhpOffice\PhpSpreadsheet\IOFactory;

function importExcel($filePath, $conn)
{
    // PhpSpreadsheet kullanarak Excel dosyasını aç
    $spreadsheet = IOFactory::load($filePath);
    $sheet = $spreadsheet->getActiveSheet();

    // Satır sayısını bul
    $highestRow = $sheet->getHighestRow();

    $startrow = 3; // Başlangıç satırı 3. satır
    while ($startrow <= $highestRow) {  // İlk iki satır başlıklar olduğu için 3. satırdan başla

        $row = $sheet->getRowIterator($startrow)->current();
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false); // Tüm hücreleri döngüye dahil et

        $data = [];
        foreach ($cellIterator as $cellIndex => $cell) {
            $cellValue = $cell->getValue();

            switch ($cellIndex) {
                case 'A':
                    $data['parent_id'] = !empty($cellValue) ? preg_replace('/\D/', '', $cellValue) : null;
                    break;
                case 'B':
                    $data['title'] = $cellValue;
                    break;
                case 'C':
                    $data['content'] = $cellValue;
                    break;
                case 'D':
                    $data['short_description'] = addslashes((string)$cellValue);
                    break;
                case 'E':
                    $data['category_name'] = $cellValue;
                    break;
                case 'F':
                    $data['unit_price'] = $cellValue;
                    break;
                case 'G':
                    $data['discounted_price'] = $cellValue;
                    break;
                case 'H':
                    $data['stock'] = $cellValue;
                    break;
                case 'I':
                    $data['meta_tags'] = $cellValue;
                    break;
                case 'J':
                    $data['images'] = $cellValue;
                    break;
                case 'K':
                    $data['variations'] = $cellValue;
                    break;
                case 'L':
                    $data['attribute'] = $cellValue;
                    break;
                case 'M':
                    $data['variations2'] = $cellValue;
                    break;
                case 'N':
                    $data['attribute2'] = $cellValue;
                    break;
                case 'O':
                    $data['variations3'] = $cellValue;
                    break;
                case 'P':
                    $data['attribute3'] = $cellValue;
                    break;
                case 'Q':
                    $data['id'] = $cellValue;
                    break;
                default:
                    break;
            }
        }

        // Veriyi ekrana yazdır
        print_r($data);

        // Ürünü oluştur
        createProduct($conn, $data);

        // Bir sonraki satıra geç
        $startrow++;
    }

    // İşlem tamamlandığında yanıt gönder
    sendResponse(200, 'Products imported successfully', $startrow);
}


function sendResponse($status, $message, $data)
{
    http_response_code($status);
    echo json_encode(["message" => $message, "data" => $data]);
    // exit();
}


function createProduct($conn, $data)
{
    // limk oluştur
    if (!empty($data['title'])) {

        $title = $data['title'] ?? ''; // Başlık null ise boş string kullan
        $link = !empty($title) ? createLink($title) : '/';
    }
    // kategori id oluştur
    if (!empty($data['category_name'])) {

        $category_id = getOrCreateCategory($conn, $data['category_name']);
    } else $category_id = 999;

    // Resimleri kaydet
    $mediaDir = '../../media';
    $coverPhotoId = $imagesData['cover_photo_id'];
    $hoverPhotoId = $imagesData['hover_photo_id'];


    // İndirim oranını hesapla
    $unitPrice = floatval($data['unit_price']);
    $discountedPrice = floatval($data['discounted_price']);
    $discount = 0; // Varsayılan değer
    if ($unitPrice > 0 && $discountedPrice > 0) {
        $discount = round(((($unitPrice - $discountedPrice) / $unitPrice) * 100), 2);
    }

    $stock = !empty($data['stock']) ? intval($data['stock']) : 0;


    // Ürün verilerini veritabanına ekle

    if (is_null($data['parent_id'])) {



        // Ürün zaten mevcut mu diye kontrol et
        $checkSql = "SELECT id FROM products WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $data['id']);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {


            // güncelleme yap

            $sql_delete_old_images = "DELETE FROM product_images WHERE product_id = ?";
            $stmt = $conn->prepare($sql_delete_old_images);
            $stmt->bind_param("i", $data['id']);
            if ($stmt->execute()) {
            } else {
                echo "Hata: " . $stmt->error;
            }
            $stmt->close();

            if (!empty($data['images'])) {

                $imageUrls = explode(',', $data['images']);
                $imageUrls = array_map('trim', $imageUrls); // URL'lerin başında/sonunda boşlukları temizle

                $imagesData = downloadImages($imageUrls, $mediaDir, $conn, $data['id']);

                $coverPhotoId = $imagesData['cover_photo_id'];
                $hoverPhotoId = $imagesData['hover_photo_id'];
                $imageIds = $imagesData['image_ids'];
            }

            // Ürünü güncelle
            $updateSql = "UPDATE products 
                          SET title = ?, content = ?, short_description = ?, unit_price = ?, stock = ?, meta_tags = ?, cover_photo_id = ?, hover_photo_id = ?, link = ?, discount = ?, category_id = ? 
                          WHERE id = ?";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param(
                "ssssiisiisdi",
                $data['title'],
                $data['content'],
                $data['short_description'],
                $unitPrice,
                $stock,
                $data['meta_tags'],
                $coverPhotoId,
                $hoverPhotoId,
                $link,
                $discount,
                $category_id,
                $data['id'] // ID'yi koşul olarak kullanıyoruz
            );

            if (!empty($data['variations'])) {
                echo ("v1 " . $data['variations']);
                addProductVariations($conn, $data['id'], $data['variations'], $data['attribute'], $unitPrice);
            }
            if (!empty($data['variation2'])) {
                echo ("v2 " . $data['variations2']);

                addProductVariations($conn, $data['id'], $data['variations2'], $data['attribute2'], $unitPrice);
            }
            if (!empty($data['variation3'])) {
                addProductVariations($conn, $data['id'], $data['variations3'], $data['attribute3'], $unitPrice);
            }

            if ($updateStmt->execute()) {
                // Ürün başarıyla güncellendi
                echo ("ürün güncellendi");
                // sendResponse(200, 'Product updated successfully', ['id' => $data['id']]);


            } else {
                sendResponse(500, 'Error updating product: ' . $updateStmt->error);
            }
            $updateStmt->close();
        } else {
            // Yeni ürünü ekle
            $checkStmt->close();

            if (!empty($data['images'])) {

                $imageUrls = explode(',', $data['images']);
                $imageUrls = array_map('trim', $imageUrls); // URL'lerin başında/sonunda boşlukları temizle

                $imagesData = downloadImages($imageUrls, $mediaDir, $conn, $data['id']);

                $coverPhotoId = $imagesData['cover_photo_id'];
                $hoverPhotoId = $imagesData['hover_photo_id'];
                $imageIds = $imagesData['image_ids'];
            }

            $sql = "INSERT INTO products (id, title, content, short_description, unit_price, stock, meta_tags, cover_photo_id, hover_photo_id, link, discount, category_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param(
                "isssiisiisdi",
                $data['id'],
                $data['title'],
                $data['content'],
                $data['short_description'],
                $unitPrice,
                $stock,
                $data['meta_tags'],
                $coverPhotoId,
                $hoverPhotoId,
                $link,
                $discount,
                $category_id
            );

            if (!empty($data['variations'])) {
                addProductVariations($conn, $data['id'], $data['variations'], $data['attribute'], $unitPrice);
            }
            if (!empty($data['variation2'])) {
                addProductVariations($conn, $data['id'], $data['variations2'], $data['attribute2'], $unitPrice);
            }
            if (!empty($data['variation3'])) {
                addProductVariations($conn, $data['id'], $data['variations3'], $data['attribute3'], $unitPrice);
            }

            if ($stmt->execute()) {
                $productId = $stmt->insert_id;
                // sendResponse(201, 'Product created successfully', ['id' => $productId]);
            } else {
                sendResponse(500, 'Error creating product: ' . $data['id']);
            }
            $stmt->close();
        }
    } else if ($data['parent_id'] !== null) {

        $parent_id = $data['parent_id'];

        // Varyasyonları ekle
        if (!empty($data['variations'])) {
            addProductVariations($conn, $data['id'], $data['variations'], $data['attribute'], $unitPrice, $data['content']);
        }
        if (!empty($data['variation2'])) {
            addProductVariations($conn, $data['id'], $data['variations2'], $data['attribute2'], $unitPrice, $data['content']);
        }
        if (!empty($data['variation3'])) {
            addProductVariations($conn, $data['id'], $data['variations3'], $data['attribute3'], $unitPrice, $data['content']);
        }
    }
}

function addProductVariations($conn, $productId, $variations, $attributes, $unitPrice)
{
    echo ("buraya geliyor: VARYASYON : " . $variations);
    $variations = is_array($variations) ? $variations : explode(',', $variations);

    foreach ($variations as $variation) {

        // Varyasyon oluştur veya al
        $variationId = getOrCreateVariation($conn, $variation);
        if (!$variationId) {
            sendResponse(500, 'Error getting or creating variation.', $variation);
            return;
        }


        $attributes = is_array($attributes) ? $attributes : explode(',', $attributes);


        foreach ($attributes as $attribute) {

            // Özniteliği oluştur veya al
            $attributeId = getOrCreateAttribute($conn, $variationId, $attribute);
            if (!$attributeId) {
                sendResponse(500, 'Error getting or creating attribute.', $attribute);
                return;
            }

            // Varyasyonu ve özniteliği ilişkilendir
            $sql = "INSERT INTO products (parent_product, unit_price, variation_id, attribute_id) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                sendResponse(500, 'Error preparing statement: ' . $conn->error);
                return;
            }

            $stmt->bind_param("iiii", $productId, $unitPrice, $variationId, $attributeId);
            if (!$stmt->execute()) {
                sendResponse(500, 'Error adding product variations: ' . $stmt->error);
                $stmt->close();
                return;
            }

            $stmt->close();
        }
    }
}

function getOrCreateVariation($conn, $name)
{
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

// Özellik kontrolü ve ekleme
function getOrCreateAttribute($conn, $variation_id, $name)
{
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



function createLink($title)
{
    // Küçük harfe dönüştür
    $slug = mb_strtolower($title, 'UTF-8');

    // Türkçe karakterleri İngilizce karşılıklarına dönüştür
    $slug = str_replace(
        array('ı', 'ğ', 'ü', 'ş', 'ç', 'ö', 'İ', 'Ğ', 'Ü', 'Ş', 'Ç', 'Ö'),
        array('i', 'g', 'u', 's', 'c', 'o', 'I', 'G', 'U', 'S', 'C', 'O'),
        $slug
    );


    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);

    $slug = trim($slug, '-');

    // Sonuna "/" ekle
    $slug .= '/';

    return $slug;
}

function downloadImages($imageUrls, $mediaDir, $conn, $productId)
{
    $coverPhotoId = null;
    $hoverPhotoId = null;
    $imageIds = [];

    foreach ($imageUrls as $index => $url) {
        $pathInfo = pathinfo($url);
        $fileName = $pathInfo['basename'];
        $fileExtension = $pathInfo['extension'];

        // Dosyayı medya klasörüne kaydet
        $destination = $mediaDir . '/' . $fileName;

        try {
            file_put_contents($destination, file_get_contents($url));
        } catch (Exception $e) {
            // Log hatası veya işlemi atla
            continue;
        }

        // Veritabanına kaydet
        $mediaId = saveMedia($conn, $fileName, $fileExtension);
        $imageIds[] = $mediaId;

        // İlk iki resmi cover ve hover olarak ayır
        if ($index === 0) {
            $coverPhotoId = $mediaId;
        } elseif ($index === 1) {
            $hoverPhotoId = $mediaId;
        }
    }

    // Ürünle ilişkilendirmek için addProductImages fonksiyonunu çağır
    addProductImages($conn, $productId, $imageIds);

    return [
        'cover_photo_id' => $coverPhotoId,
        'hover_photo_id' => $hoverPhotoId,
        'image_ids' => $imageIds
    ];
}


// Resimleri ekle
function addProductImages($conn, $productId, $images)
{
    $sql = "INSERT INTO product_images (product_id, media_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    foreach ($images as $imageId) {
        $stmt->bind_param("ii", $productId, $imageId);
        if (!$stmt->execute()) {
            sendResponse(500, 'Error adding product images: ' . $stmt->error);
        }
    }
}

function saveMedia($conn, $fileName, $fileExtension)
{

    $fileNameWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME); // Uzantıyı ayır, sadece dosya adını al

    $sql = "INSERT INTO media (file_name, file_extension) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $fileNameWithoutExtension, $fileExtension);

    if ($stmt->execute()) {
        return $stmt->insert_id; // Son eklenen ID'yi döndür
    } else {
        throw new Exception("Error saving media: " . $stmt->error);
    }
}

function getOrCreateCategory($conn, $name)
{
    if (strpos($name, ',') !== false) {
        // Virgülle ayrılmışsa, ilk elemanı al
        $name = explode(',', $name)[0];
    } else {
        // Tek bir isim varsa, olduğu gibi kullan
        $name = $name;
    }


    // Kategoriyi kontrol etmek için SQL sorgusu
    $sql = "SELECT id FROM categories WHERE name = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        sendResponse(500, 'Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();

    // Eğer kategori varsa ID'yi döndür
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id);
        $stmt->fetch();
        $stmt->close();
        return $id;
    } else {
        // Kategori yoksa, yeni kategori ekle
        $stmt->close();
        $sql = "INSERT INTO categories (name) VALUES (?)";
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
            sendResponse(500, 'Error creating category: ' . $stmt->error);
        }
    }
}



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['excel_file']) && $_FILES['excel_file']['error'] === UPLOAD_ERR_OK) {
        $filePath = $_FILES['excel_file']['tmp_name']; // Geçici dosya yolu
        importExcel($filePath, $conn); // Excel dosyasını işle
    } else {
        sendResponse(400, 'No file uploaded or upload error');
    }
}

$conn->close();
