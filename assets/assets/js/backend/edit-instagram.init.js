document.getElementById('delete-post').addEventListener('click', function() {
    const postId = document.getElementById('product-id-input').value;

    fetch('/Yonetici/api/instagram.php?instagrampostId='+postId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instagrampostId: postId })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Post Silindi!');
        setTimeout(function() {
            window.location.href = '/Yonetici/instagram-link.php';
        }, 2000);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


var content = null
var desc  = null




var thumbnailArray = [];
var thumbnailIDArray = [];

var featuredImage = null;
var featuredImageID = null;

var secondaryImage = null;
var secondaryImageID = null;


var featuredDropzone = new Dropzone("div#featured-dropzone", { 
    maxFiles: 1, // Yalnızca bir dosyaya izin ver
    url: "/Yonetici/api/media.php",
    acceptedFiles: "image/*", 
    addRemoveLinks: true,
    removedfile: function (file) {
        deleteMedia(file.id)
        file.previewElement.remove();

        featuredImage=null
        featuredImageID=null

    },
    init: function() {
        this.on("maxfilesexceeded", function(file) {
            this.removeAllFiles(); // Yeni dosya eklenirse, eski dosyayı kaldır
            this.addFile(file); // Yeni dosyayı ekle
        });
        this.on("success", function(file, response) {
            featuredImageID = response.data.id
            file.id=response.data.id
        });
    }

});
featuredDropzone.on("thumbnail", function (file, dataUrl) {
    featuredImage=dataUrl
});





function deleteMedia(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/Yonetici/api/media.php", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response.message); // Başarılı yanıt
                alert("File deleted successfully");
            } else {
                var response = JSON.parse(xhr.responseText);
                console.error(response.message); // Hata yanıtı
                alert("Failed to delete file: " + response.message);
            }
        }
    };

    var data = JSON.stringify({ "id": id });
    xhr.send(data);
}

const postID = document.getElementById('product-id-input').value;

// Product Detail
const xhttp_product = new XMLHttpRequest();
xhttp_product.onload = function () {
    var json_records = JSON.parse(this.responseText);   
    console.log(json_records);

    // Populate product URL input
    document.getElementById('product-url-input').value = json_records.link;

    // Initialize featured image in Dropzone
    var mockFileCover = { 
        id: json_records.media_id, 
        name: json_records.file_name + '.'+ json_records.file_extension, // Name and extension combined
        size: 0 
    };
    featuredDropzone.options.addedfile.call(featuredDropzone, mockFileCover);
    featuredDropzone.options.thumbnail.call(featuredDropzone, mockFileCover, '/media/'+ json_records.file_name + '.' + json_records.file_extension);
    featuredImageID = json_records.media_id;


};
xhttp_product.open("GET", "/Yonetici/api/instagram.php?id=" + postID);
xhttp_product.send();



var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    var editinputValueJson = JSON.parse(editinputValueJson);
    document.getElementById("formAction").value = "edit";
    document.getElementById("product-id-input").value = editinputValueJson.id;
    document.getElementById("product-url-input").value = editinputValueJson.link;

    
    // clothe-colors
  
}

var forms = document.querySelectorAll('.needs-validation')
// date & time
var date = new Date().toUTCString().slice(5, 16);




Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();

            // Form verilerini toplama
            const linkInput = document.getElementById('product-url-input').value;
            const coverImageID = featuredImageID; // cover_image kontrolü için

            // Boş veri kontrolü
            if (!linkInput) {
                alert('Link alanı boş olamaz!');
                return; // Boş veri kontrolü yapıldı, fonksiyonu sonlandır
            }
            if (!coverImageID) {
                alert('Kapak resmi seçilmelidir!');
                return; // Boş veri kontrolü yapıldı, fonksiyonu sonlandır
            }

            const formData = {
                id: postID,
                cover_image: coverImageID,
                link: linkInput
            };

            console.log('data', formData);

            // AJAX isteği oluşturma
            const xhttp_createPage = new XMLHttpRequest();
            xhttp_createPage.onload = function () {
                if (this.status === 201) {
                    alert('Post Güncellendi!');
                    setTimeout(function () {
                        window.location.href = "/Yonetici/instagram-link.php";
                    }, 2000);
                } else {
                    alert('Post Güncellenemedi!');
                }
            };
            xhttp_createPage.onerror = function () {
                alert('Bir hata oluştu!');
            };
            xhttp_createPage.open("POST", "/Yonetici/api/instagram.php?id=" + postID);
            xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createPage.send(JSON.stringify(formData));
        }

        form.classList.add('was-validated');
    }, false);
});
