/*
Template Name: Toner eCommerce + Admin HTML Template
Author: Themesbrand
Version: 1.2.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Create Product init File
*/
var content = null
var desc = null
let contentEditorInstances = {}; // CKEditor örneklerini saklamak için bir nesne

  let contentEditor, descEditor;

        // İlk editörü başlatın
        ClassicEditor
            .create(document.querySelector('#ckeditor-classic'))
            .then(function (editor) {
                contentEditor = editor;
                editor.ui.view.editable.element.style.height = '200px';
            })
            .catch(function (error) {
                console.error(error);
            });

        // İkinci editörü başlatın
        ClassicEditor
            .create(document.querySelector('#ckeditor-classic-desc'))
            .then(function (editor) {
                descEditor = editor;
                editor.ui.view.editable.element.style.height = '100px';
            })
            .catch(function (error) {
                console.error(error);
            });
            
            


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

var secondaryImageDropzone = new Dropzone("div#secondaryImage-dropzone", { 
    maxFiles: 1, // Yalnızca bir dosyaya izin ver
    url: "/Yonetici/api/media.php",
    acceptedFiles: "image/*", 
    addRemoveLinks: true,
    removedfile: function (file) {
        deleteMedia(file.id)
        file.previewElement.remove();

        secondaryImage=null
        secondaryImageID=null

    },
    init: function() {
        this.on("maxfilesexceeded", function(file) {
            this.removeAllFiles(); // Yeni dosya eklenirse, eski dosyayı kaldır
            this.addFile(file); // Yeni dosyayı ekle
        });
        this.on("success", function(file, response) {
            secondaryImageID = response.data.id
            file.id=response.data.id
        });
    }

});

secondaryImageDropzone.on("thumbnail", function (file, dataUrl) {
    secondaryImage=dataUrl
});

// Dropzone has been added as a global variable.

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



var categories = [];
const selectCategory2 = document.getElementById('choices-category-input-2');

// Category List
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    var json_records = JSON.parse(this.responseText);
    
    // Kategorileri diziye ekle
    Array.from(json_records).forEach(function (element) {
        categories.push(element);
    });

    // Seçenekleri her iki dropdown'a ekleyelim
    categories.forEach(category => {

        //  dropdown için seçenek ekleyelim
        const option2 = document.createElement('option');
        option2.value = category.id;
        option2.textContent = category.name;
        selectCategory2.appendChild(option2);
    });

    // Choices.js ile multiple select özelliği ekleyelim
    new Choices(selectCategory2, {
        removeItemButton: true,
        searchEnabled: true,
        placeholder: true,
        placeholderValue: 'Kategori seçin'
    });
}

xhttp.open("GET", "/Yonetici/api/categories.php");
xhttp.send();




var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    var editinputValueJson = JSON.parse(editinputValueJson);
    document.getElementById("formAction").value = "edit";
    document.getElementById("product-id-input").value = editinputValueJson.id;
    document.getElementById("product-sentence-input").value = editinputValueJson.sentence;
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

var forms = document.querySelectorAll('.needs-validation')
// date & time
var date = new Date().toUTCString().slice(5, 16);

var itemid = 13;
var colorsArray = [];
var sizesArray = [];
var variations = [];
var variations2 = [];
let dropdowns = [];


var tags = new Choices('#meta-tag-input',{
    silent: false,
    items: [],
    choices: [],
    renderChoiceLimit: -1,
    maxItemCount: -1,
    addItems: true,
    allowHTML:true,
});



document.getElementById('add-variation-2').addEventListener('click', function () {
    variations2.push({
        variation_name: '',
        attributes: [], 
    });

    console.log(variations2);
    const index = variations2.length - 1; 

    const tabId = `variation-tab-${index}`;
    const tabContentId = `variation-content-${index}`;
    const tabHtml = `
        <li class="nav-item" role="presentation">
            <a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}" data-bs-toggle="tab" href="#${tabContentId}" role="tab" aria-controls="${tabContentId}" aria-selected="${index === 0}">
                Varyasyon ${index + 1}
            </a>
      
        </li>
    `;
    document.getElementById('variationTabs').insertAdjacentHTML('beforeend', tabHtml);

    const variationHtml2 = `
        <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id="${tabContentId}" role="tabpanel" aria-labelledby="${tabId}">
            <div class="row">
                <div class="col-lg-2">
                    <div class="mt-3 mt-lg-0">
                        <label class="form-label" for="variation-input-name-${index}">
                            Varyasyon Adı 
                            <i class="bi bi-plus-circle ms-2" style="cursor: pointer;" id="add-details-${index}"></i> 
                        </label>
                        <input class="form-control" required name="variation-input-name" id="variation-input-name-${index}" type="text">
                        <div class="invalid-feedback">Lütfen varyasyon adı girin.</div>
                    </div>
                </div>
            </div>
            <div id="extra-details-wrapper-${index}"></div>
        </div>
    `;
    document.getElementById('variationTabContent').insertAdjacentHTML('beforeend', variationHtml2);

    document.getElementById(`variation-input-name-${index}`).addEventListener('input', function (event) {
        const inputVal = event.target.value;
        document.getElementById(tabId).textContent = inputVal || `Varyasyon ${index + 1}`;
        variations2[index].variation_name = inputVal;
    });

    document.getElementById(`add-details-${index}`).addEventListener('click', function () {
        const detailsCount = document.querySelectorAll(`#extra-details-wrapper-${index} .row`).length;
        
        const previousStock = document.getElementById(`stock-input-${index}-${detailsCount-1}`)?.value || '';
        const previousPrice = document.getElementById(`product-price-input-${index}-${detailsCount-1}`)?.value || '';
        const previousDiscount = document.getElementById(`product-discount-input-${index}-${detailsCount-1}`)?.value || '';
        const previousContent = document.getElementById(`content-input-name-${index}-${detailsCount-1}`)?.value || '';

        const newDetailsHtml = `
            <div id="extra-details-${index}-${detailsCount}" class="row">
                <div class="col-lg-2">
                    <div class="mt-3 mt-lg-0">
                        <label class="form-label" for="attribute-input-name-${index}-${detailsCount}">Nitelikleri</label>
                        <input class="form-control" required name="attribute-input-name" id="attribute-input-name-${index}-${detailsCount}" type="text" value="">
                        <div class="invalid-feedback">Lütfen nitelik adı girin.</div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="stock-input-${index}-${detailsCount}">Stok Adedi</label>
                        <input type="text" class="form-control" id="stock-input-${index}-${detailsCount}" placeholder="Stok" required value="${previousStock}">
                        <div class="invalid-feedback">Lütfen stok sayısı girin.</div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="product-price-input-${index}-${detailsCount}">Fiyat</label>
                        <div class="input-group has-validation mb-3">
                            <span class="input-group-text" id="product-price-addon">₺</span>
                            <input type="text" class="form-control" id="product-price-input-${index}-${detailsCount}" placeholder="Enter price" aria-label="Price" aria-describedby="product-price-addon" required value="${previousPrice}">
                            <div class="invalid-feedback">Fiyat Girin.</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="product-discount-input-${index}-${detailsCount}">İndirim</label>
                        <div class="input-group has-validation mb-3">
                            <span class="input-group-text" id="product-discount-addon">%</span>
                            <input type="text" class="form-control" id="product-discount-input-${index}-${detailsCount}" placeholder="Enter discount" aria-label="discount" aria-describedby="product-discount-addon" required value="${previousDiscount}">
                            <div class="invalid-feedback">İndirim girin.</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2">
                    <div class="mt-3 mt-lg-0">
                        <label class="form-label" for="content-input-name-${index}-${detailsCount}">Açıklama</label>
                        <input class="form-control" name="content-input-name" id="content-input-name-${index}-${detailsCount}" type="text" value="${previousContent}">
                    </div>
                </div>
                   <div class="col-lg-1">
            <button type="button" class="btn btn-danger btn-sm delete-attribute-btn" id="delete-attribute-${index}-${detailsCount}">
                Sil
            </button>
        </div>
            </div>
        `;

        document.getElementById(`extra-details-wrapper-${index}`).insertAdjacentHTML('beforeend', newDetailsHtml);
        
        variations2[index].attributes.push({
            stock: previousStock,
            price: previousPrice,
            discount: previousDiscount,
            content: previousContent
        });

        document.getElementById(`attribute-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
            variations2[index].attributes[detailsCount].attribute_name = event.target.value ;
        });

        document.getElementById(`stock-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
            variations2[index].attributes[detailsCount].stock = event.target.value ;
        });

        document.getElementById(`product-price-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
            variations2[index].attributes[detailsCount].price = event.target.value ;
        });

        document.getElementById(`product-discount-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
            variations2[index].attributes[detailsCount].discount = event.target.value;
        });

        document.getElementById(`content-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
            variations2[index].attributes[detailsCount].content = event.target.value ;
        });
        //  document.getElementById(`delete-variation-${index}`).addEventListener('click', function () {

        //         variations2.splice(index, 1);

        //         const tabElement = document.getElementById(`variation-tab-${index}`);
        //         const tabContentElement = document.getElementById(`variation-content-${index}`);

        //         if (tabElement) {
        //             tabElement.parentElement.remove(); 
        //         }

        //         if (tabContentElement) {
        //             tabContentElement.remove(); 
        //         }

        //         console.log('Variation silindi:', variations2);
        //     });


            document.getElementById(`delete-attribute-${index}-${detailsCount}`).addEventListener('click', function () {
                variations2[index].attributes.splice(detailsCount, 1);

                document.getElementById(`extra-details-${index}-${detailsCount}`).remove();
                console.log('Attribute silindi:', variations2);
            });
    });
});





// -------------------------------------------------------


document.getElementById('add-variation').addEventListener('click', function () {
    // Boş bir varyasyon nesnesi ekle
    variations.push({
        variation_name: '',
        attribute_name: '',
        price: '',
        discount: '',
        stock: '',
        content: ''

    });

    // Varyasyonun indexini al
    const index = variations.length - 1;
    // HTML kodunu oluştur
    const variationHtml = `
        <div class="col-lg-2">
            <div class="mt-3 mt-lg-0">
                <label class="form-label" for="variation-input-name-${index}">Varyasyon Adı</label>
                <input class="form-control" required name="variation-input-name" id="variation-input-name-${index}" type="text">
                <div class="invalid-feedback">Lütfen varyasyon adı girin.</div>
            </div>
        </div>
        <div class="col-lg-2">
            <div class="mt-3 mt-lg-0">
                <label class="form-label" for="attribute-input-name-${index}">Nitelikleri</label>
                <input class="form-control" required name="attribute-input-name" id="attribute-input-name-${index}" type="text">
                <div class="invalid-feedback">Lütfen nitelik adı girin.</div>
            </div>
        </div>
        <div class="col-lg-2 col-sm-6">
            <div class="mb-3">
                <label class="form-label" for="stock-input-${index}">Stok Adedi</label>
                <input type="text" class="form-control" id="stock-input-${index}" placeholder="Stok" required>
                <div class="invalid-feedback">Lütfen stok sayısı girin.</div>
            </div>
        </div>
        <div class="col-lg-2 col-sm-6">
            <div class="mb-3">
                <label class="form-label" for="product-price-input-${index}">Fiyat</label>
                <div class="input-group has-validation mb-3">
                    <span class="input-group-text" id="product-price-addon">₺</span>
                    <input type="text" class="form-control" id="product-price-input-${index}" placeholder="Enter price" aria-label="Price" aria-describedby="product-price-addon" required>
                    <div class="invalid-feedback">Fiyat Girin.</div>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-sm-6">
            <div class="mb-3">
                <label class="form-label" for="product-discount-input-${index}">İndirim</label>
                <div class="input-group has-validation mb-3">
                    <span class="input-group-text" id="product-discount-addon">%</span>
                    <input type="text" class="form-control" id="product-discount-input-${index}" placeholder="Enter discount" aria-label="discount" aria-describedby="product-discount-addon" required>
                    <div class="invalid-feedback">İndirim girin.</div>
                </div>
            </div>
        </div>
        <div class="col-lg-2">
            <div class="mt-3 mt-lg-0">
                <label class="form-label" for="content-input-name-${index}">Açıklama</label>
                <input class="form-control"  name="content-input-name" id="content-input-name-${index}" type="text">
            </div>
        </div>
        
    `;

    // Oluşturulan HTML'i variations div'ine ekle
    document.getElementById('variations').insertAdjacentHTML('beforeend', variationHtml);

    // Input alanlarına event listener ekle
    document.getElementById(`variation-input-name-${index}`).addEventListener('input', function (event) {
        variations[index].variation_name = event.target.value;
    });

    document.getElementById(`attribute-input-name-${index}`).addEventListener('input', function (event) {
        variations[index].attribute_name = event.target.value;
    });

    document.getElementById(`stock-input-${index}`).addEventListener('input', function (event) {
        variations[index].stock = event.target.value;
    });

    document.getElementById(`product-price-input-${index}`).addEventListener('input', function (event) {
        variations[index].price = event.target.value;
    });

    document.getElementById(`product-discount-input-${index}`).addEventListener('input', function (event) {
        variations[index].discount = event.target.value;
    });
    document.getElementById(`content-input-name-${index}`).addEventListener('input', function (event) {
        variations[index].content = event.target.value;
    });
});




let index_dropdown = 0;

// Dropdown ekleme butonuna tıklandığında
document.getElementById('add-dropdown').addEventListener('click', function() {
    // Boş bir dropdown nesnesi ekle
    dropdowns.push({
        title: '',
        content: '',
        order: ''
    });

    // Dropdownun indexini al
    const index = dropdowns.length - 1;

    const dropdownHtml = `
        <div class="col-lg-4 col-sm-6 mb-3" style="width: 70%; margin-left: 10px; margin-right: 10px;">
            <label class="form-label" for="title-input-${index}">Başlık</label>
            <input type="text" class="form-control" id="title-input-${index}" placeholder="Başlık" required>
            <div class="invalid-feedback">Lütfen Başlık girin.</div>
        </div>
        
        <div class="col-lg-4 col-sm-6 mb-3" style="width: 10%;">
            <label class="form-label" for="order-input-${index}">Sıra No</label>
            <input type="text" class="form-control" id="order-input-${index}" placeholder="Sıra No" required>
            <div class="invalid-feedback">Lütfen Sıra No girin.</div>
        </div>
        
        <div class="" style="width: 100%; margin-right: 10px; margin-left: 10px;">
            <div>
                <label class="form-label" for="content-input-${index}">İçerik</label>
                <textarea class="form-control" id="content-input-${index}" placeholder="İçerik" required></textarea>
                <div class="invalid-feedback">Lütfen İçerik girin.</div>
            </div>
        </div>
    `;
    
    const dropdownContent = document.getElementById('dropdown-content');
    const div = document.createElement('div');
    div.classList.add('d-flex', 'flex-wrap', 'mb-3');  
    div.innerHTML = dropdownHtml;
    dropdownContent.appendChild(div);

    // CKEditor'i yeni dropdown içerik alanı için başlatın
    ClassicEditor
        .create(document.querySelector(`#content-input-${index}`))
        .then(function (editor) {
            contentEditorInstances[`content-input-${index}`] = editor; // Yeni editor örneğini saklayın
            editor.ui.view.editable.element.style.height = '200px'; // CKEditor'in yüksekliği

            // CKEditor ile içeriği yönetin
            editor.model.document.on('change:data', () => {
                dropdowns[index].content = editor.getData();
            });
        })
        .catch(function (error) {
            console.error(error);
        });

    // Input alanlarına event listener ekle
    document.getElementById(`title-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].title = event.target.value;
    });

    document.getElementById(`order-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].order = event.target.value;
    });

    index_dropdown++;
});







Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
          
    const content = contentEditor.getData();
    const contentdesc = descEditor.getData();
    
    function formatProductUrl() {
     var input = document.getElementById('product-url-input').value;
    
     var formattedInput = input
        .toLowerCase()  
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/Ş/g, 's')
        .replace(/İ/g, 'i')
        .replace(/Ö/g, 'o')
        .replace(/Ç/g, 'c')
        .replace(/\s+/g, '-')  
        .replace(/[^a-z0-9-]/g, '');  
        
         if (!formattedInput.endsWith('/')) {
        formattedInput += '/';
    }
    

    return formattedInput;
}

            var productUrl = formatProductUrl();
            console.log(productUrl);  
        var newCategoryInput = document.getElementById('new_category').value.trim();
 

            const formData = {
                cover_image: featuredImageID,
                hover_image: secondaryImageID,
                title:document.getElementById('product-title-input').value,
                sentence:document.getElementById('product-sentence-input').value,
                youtube_url:document.getElementById('youtube_url').value,
                link:productUrl,
                content : content,
                desc:contentdesc,
                 price:document.getElementById('product-price-input').value,
                discount:document.getElementById('product-discount-input').value,
                stock:document.getElementById('stocks-input').value,
                stock:document.getElementById('stocks-input').value,
                images:thumbnailIDArray,
                variations:variations2,
                dropdowns:dropdowns,
                tags:tags.getValue(true).join(','),
                new_category:newCategoryInput,
                category_ids: Array.from(document.getElementById('choices-category-input-2').selectedOptions).map(option => parseInt(option.value)).join(',')  // Virgülle ayırarak string'e dönüştürüyoruz

            }
            
            const xhttp_createPage = new XMLHttpRequest();
            xhttp_createPage.onload = function () {
            if (this.status === 201 || this.status === 200) {
                    alert('Ürün Oluşturuldu!')
    
                    setTimeout(function() {
                        window.location.href = "/Yonetici/product-list.php";
                    }, 2000);
                } else {
                    alert('ürün oluşturulamadı')
                }
            };
            xhttp_createPage.onerror = function () {
                alert('hata')
            };
            xhttp_createPage.open("POST", "/Yonetici/api/products.php");
            xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createPage.send(JSON.stringify(formData));

        }

        form.classList.add('was-validated');

    }, false)
});

document.addEventListener('DOMContentLoaded', function () {
    const newCategoryButton = document.getElementById('new_category_button');
    const newCategoryButtonDelete = document.getElementById('new_category_button_delete');
    const newCategoryDiv = document.getElementById('new_category_div');
    const newCategoryInput = document.getElementById('new_category');
        newCategoryButtonDelete.classList.add('d-none'); // "Sil" butonunu gizle


    newCategoryButton.addEventListener('click', function (event) {
        event.preventDefault();
        newCategoryDiv.classList.remove('d-none'); // 'd-none' sınıfını kaldır
        newCategoryDiv.classList.add('d-block');  // 'd-block' sınıfını ekle
        newCategoryButton.classList.add('d-none'); // "Yeni ekle" butonunu gizle
        newCategoryButtonDelete.classList.remove('d-none'); // "Sil" butonunu göster
    });

    newCategoryButtonDelete.addEventListener('click', function (event) {
        event.preventDefault();
        newCategoryDiv.classList.remove('d-block'); // 'd-block' sınıfını kaldır
        newCategoryDiv.classList.add('d-none'); // 'd-none' sınıfını ekle
        newCategoryInput.value = ''; // Input alanını temizle
        newCategoryButton.classList.remove('d-none'); // "Yeni ekle" butonunu göster
        newCategoryButtonDelete.classList.add('d-none'); // "Sil" butonunu gizle
    });
});