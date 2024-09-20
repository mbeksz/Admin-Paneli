document.addEventListener('DOMContentLoaded', function () {
    var desc = null;
    var products = [];
    var featuredImage = null;
    var featuredImageID = null;

    var featuredDropzone = new Dropzone("div#featured-dropzone", {
        maxFiles: 1, // Yalnızca bir dosyaya izin ver
        url: "/Yonetici/api/media.php",
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        removedfile: function (file) {
            deleteMedia(file.id);
            file.previewElement.remove();

            featuredImage = null;
            featuredImageID = null;
        },
        init: function () {
            this.on("maxfilesexceeded", function (file) {
                this.removeAllFiles(); // Yeni dosya eklenirse, eski dosyayı kaldır
                this.addFile(file); // Yeni dosyayı ekle
            });
            this.on("success", function (file, response) {
                featuredImageID = response.data.id;
                file.id = response.data.id;
            });
        }
    });

    featuredDropzone.on("thumbnail", function (file, dataUrl) {
        featuredImage = dataUrl;
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

    const productID = document.getElementById('page-id-input').value;
    let selectedproductId = null;

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (xhttp.status === 200) {
            const json_records = JSON.parse(this.responseText);
            console.log(json_records);

            // Store products in array
            products = json_records;

            // Select dropdown element
            const selectMenu = document.querySelector('#choices-menu-input');

            // Clear existing options
            selectMenu.innerHTML = '';

            // Populate dropdown with products
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.title;
                selectMenu.appendChild(option);
            });

            // Set selected option if selectedproductId is not null
            if (selectedproductId !== null) {
                selectMenu.value = selectedproductId;
            }
        } else {
            console.error('Failed to fetch data');
        }
    };
    xhttp.onerror = function () {
        console.error('Request error');
    };
    xhttp.open("GET", "/Yonetici/api/products.php");
    xhttp.send();

    const xhttp_product = new XMLHttpRequest();
    xhttp_product.onload = function () {
        if (xhttp_product.status === 200) {
            const json_records = JSON.parse(this.responseText);
            console.log(json_records);

            document.getElementById('product-order-input').value = json_records.order;
            document.getElementById('product-desc-input').value = json_records.description;
            document.getElementById('product-media-id-input').value = json_records.product_id;

            selectedproductId = json_records.product_id;

            var mockFileCover = {
                id: json_records.media_id,
                name: json_records.file_name + '.' + json_records.file_extension, // Name and extension combined
                size: 0
            };
            featuredDropzone.options.addedfile.call(featuredDropzone, mockFileCover);
            featuredDropzone.options.thumbnail.call(featuredDropzone, mockFileCover, '/media/' + json_records.file_name + '.' + json_records.file_extension);
            featuredImageID = json_records.media_id;
            console.log(json_records.media_id);
        } else {
            console.error('Failed to fetch product details');
        }
    };
    xhttp_product.onerror = function () {
        console.error('Request error');
    };
    xhttp_product.open("GET", `/Yonetici/api/home-cart.php?id=${productID}`);
    xhttp_product.send();

    var forms = document.querySelectorAll('.needs-validation');

    // date & time
    var date = new Date().toUTCString().slice(5, 16);
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();

                const firstID = document.getElementById('product-media-id-input').value;
                console.log(firstID);
                const coverImageID = featuredImageID == null ? firstID  : featuredImageID;
                console.log(coverImageID);
                const formData = {
                    id: productID,
                    cover_image: coverImageID,
                    order: document.getElementById('product-order-input').value,
                    description: document.getElementById('product-desc-input').value,
                    product_id: document.getElementById('choices-menu-input').value,
                };
                console.log('data', formData);

                const xhttp_createPage = new XMLHttpRequest();
                xhttp_createPage.onload = function () {
                    if (this.status === 201) {
                        alert('Post Güncellendi!');
                        setTimeout(function () {
                            window.location.href = "/Yonetici/home-cart.php";
                        }, 2000);
                    } else {
                        alert('Post Güncellenemedi!');
                    }
                };
                xhttp_createPage.onerror = function () {
                    alert('hata');
                };
                xhttp_createPage.open("POST", "/Yonetici/api/home-cart.php?id=" + productID);
                xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhttp_createPage.send(JSON.stringify(formData));
            }

            form.classList.add('was-validated');
        }, false);
    });
});
