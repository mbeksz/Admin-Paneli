<?php
// Oturumu başlat
session_start();

// Oturum kontrolü
if (!isset($_SESSION['jwt'])) {
    header("Location: login.php");
    exit(); 
}

if ($_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}
?>




