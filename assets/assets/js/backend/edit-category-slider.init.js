
var content = null
var desc = null

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


const productID = document.getElementById('category-id-input').value;

// Product Detail
const xhttp_product = new XMLHttpRequest();
xhttp_product.onload = function () {
    var json_records = JSON.parse(this.responseText);   
    console.log(json_records);

    document.getElementById('product-url-input').value = json_records.link;
    document.getElementById('product-title-input').value = json_records.title;
    document.getElementById('product-order-input').value = json_records.order_number;

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
xhttp_product.open("GET", "/Yonetici/api/category-slider.php?id=" + productID);
xhttp_product.send();



var myDropzone = new Dropzone("div.my-dropzone", { 
    url: "/Yonetici/api/media.php",
    addRemoveLinks: true,
    acceptedFiles: "image/*", 
    removedfile: function (file) {
        deleteMedia(file.id)
        var index = thumbnailIDArray.findIndex(item=>item===file.id)
        console.log('index',index)
        file.previewElement.remove();
        thumbnailArray.splice(index,1);
        thumbnailIDArray.splice(index,1);

    },
    
    init: function() {

        this.on("success", function(file, response) {
            console.log('response',response)
            thumbnailIDArray.push(response.data.id)
            file.id = response.data.id;
            featuredImageID = response.data.id
            console.log(thumbnailIDArray)
        });
    }
});

myDropzone.on("thumbnail", function (file, dataUrl) {
    thumbnailArray.push(dataUrl);
});
var mockFile = { name: "Existing file!", size: 12345 };

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



var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    var editinputValueJson = JSON.parse(editinputValueJson);
    document.getElementById("formAction").value = "edit";
    document.getElementById("product-id-input").value = editinputValueJson.id;
    //productCategoryInput.setChoiceByValue(editinputValueJson.category);
    myDropzone.options.addedfile.call(myDropzone, mockFile);
    myDropzone.options.thumbnail.call(myDropzone, mockFile, editinputValueJson.productImg);
    thumbnailArray.push(editinputValueJson.productImg)
    document.getElementById("product-title-input").value = editinputValueJson.productTitle;
    document.getElementById("stocks-input").value = editinputValueJson.stock;
    document.getElementById("product-price-input").value = editinputValueJson.price;
    document.getElementById("product-discount-input").value = editinputValueJson.discount;
    //document.getElementById("orders-input").value = editinputValueJson.orders;
    
    // clothe-colors
    Array.from(document.querySelectorAll(".clothe-colors li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        editinputValueJson.color.map(function(subItem){
            if (subItem == nameelem.value) {
                nameelem.setAttribute("checked", "checked");
            }
        })
    })

    // clothe-size
    Array.from(document.querySelectorAll(".clothe-size li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        if(editinputValueJson.size){
            editinputValueJson.size.map(function(subItem){
                if (subItem == nameelem.value) {
                    nameelem.setAttribute("checked", "checked");
                }
            })
        }
    })
}

function submitForm() {
    // Formdaki alanların geçerli olup olmadığını kontrol et
    var titleInput = document.getElementById('product-title-input');
    var urlInput = document.getElementById('product-url-input');
    var orderInput = document.getElementById('product-order-input');
    var categoryIDInput = document.getElementById('category-id-input');

    if (!titleInput.checkValidity() || !urlInput.checkValidity() || !orderInput.checkValidity()) {
        // Geçersiz alan varsa invalid-feedback mesajlarını göster
        titleInput.reportValidity();
        urlInput.reportValidity();
        orderInput.reportValidity();
        return;
    }

    // Form verilerini hazırla
    var formData = {
        cover_image: featuredImageID, // featuredImageID değişkeninin tanımlı olduğundan emin olun
        link: urlInput.value,
        title: titleInput.value,
        order: orderInput.value
    };

    // AJAX isteğini yap
    var xhttp_createPage = new XMLHttpRequest();
    xhttp_createPage.onload = function() {
        if (this.status === 200) {
            alert('Guncellendi!');

            // Opsiyonel: Başka bir sayfaya yönlendirme
            setTimeout(function() {
                window.location.href = "/Yonetici/category-slider.php";
            }, 2000); // 2 saniye sonra yönlendir
        } else {
            alert('Guncellenmedi: ' + this.responseText);
        }
    };
    xhttp_createPage.onerror = function() {
        alert('Hata: ' + this.responseText);
    };
    var categoryID = categoryIDInput.value;

    xhttp_createPage.open("POST", "/Yonetici/api/category-slider.php?id=" + categoryID);
    xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp_createPage.send(JSON.stringify(formData));
}

