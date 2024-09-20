<?php

// Veritabanı bağlantı bilgileri
$servername = ""; // Veritabanı sunucusunun adı veya IP adresi
$username = ""; // Veritabanı kullanıcı adı
$password = ""; // Veritabanı parolası
$database = ""; // Veritabanı adı

// Veritabanına bağlanma
$conn = new mysqli($servername, $username, $password, $database);

// Bağlantıyı kontrol etme
if ($conn->connect_error) {
    die("Veritabanına bağlantı hatası: " . $conn->connect_error);
}

// Türkçe karakter sorununu çözmek için karakter setini ayarlama
$conn->set_charset("utf8");


?>