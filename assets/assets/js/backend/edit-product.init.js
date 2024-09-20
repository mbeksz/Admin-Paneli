
let productList = []
let resultVariationsArray = [];
let contentEditor, descEditor;
var similarProducts = new Choices('#choices-similar-products-input', {
    removeItemButton: true,
});


var relatedProducts = new Choices('#choices-related-products-input', {
    removeItemButton: true,
});

const products_xhttp = new XMLHttpRequest();
products_xhttp.onload = function () {
    if (products_xhttp.status === 200) {
        const json_records = JSON.parse(this.responseText);
        productList = json_records

        similarProducts.setChoices(productList, 'id', 'title', false);
        relatedProducts.setChoices(productList, 'id', 'title', false);


    } else {
        console.error('Failed to fetch data');
    }
};
products_xhttp.onerror = function () {
    console.error('Request error');
};
products_xhttp.open("GET", "/Yonetici/api/products.php");
products_xhttp.send();


var content = null
var desc = null



var tags = new Choices('#meta-tag-input', {
    silent: false,
    items: [],
    choices: [],
    renderChoiceLimit: -1,
    maxItemCount: -1,
    addItems: true,
    allowHTML: true,
});
var variations = []
var variations2 = []

var dropdowns = []
const contentEditorInstances = {};


// var content = CodeMirror.fromTextArea(document.getElementById("ckeditor-content"), {
//     lineNumbers: true, // Satır numaralarını göster
//     mode: "html", // Düzenleme modu (örneğin JavaScript)
//     theme: "dracula",
// });

// content.setSize(null, 500)
// var desc = CodeMirror.fromTextArea(document.getElementById("ckeditor-desc"), {
//     lineNumbers: true, // Satır numaralarını göster
//     mode: "css",
//     theme: "dracula",
// });



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

        featuredImage = null
        featuredImageID = null

    },
    init: function () {
        this.on("maxfilesexceeded", function (file) {
            this.removeAllFiles(); // Yeni dosya eklenirse, eski dosyayı kaldır
            this.addFile(file); // Yeni dosyayı ekle
        });
        this.on("success", function (file, response) {
            featuredImageID = response.data.id
            file.id = response.data.id
        });
    }

});
featuredDropzone.on("thumbnail", function (file, dataUrl) {
    featuredImage = dataUrl
});

var secondaryImageDropzone = new Dropzone("div#secondaryImage-dropzone", {
    maxFiles: 1, // Yalnızca bir dosyaya izin ver
    url: "/Yonetici/api/media.php",
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    removedfile: function (file) {
        deleteMedia(file.id)
        file.previewElement.remove();

        secondaryImage = null
        secondaryImageID = null

    },
    init: function () {
        this.on("maxfilesexceeded", function (file) {
            this.removeAllFiles(); // Yeni dosya eklenirse, eski dosyayı kaldır
            this.addFile(file); // Yeni dosyayı ekle
        });
        this.on("success", function (file, response) {
            secondaryImageID = response.data.id
            file.id = response.data.id
        });
    }

});

secondaryImageDropzone.on("thumbnail", function (file, dataUrl) {
    secondaryImage = dataUrl
});

// Dropzone has been added as a global variable.

var myDropzone = new Dropzone("div.my-dropzone", {
    url: "/Yonetici/api/media.php",
    addRemoveLinks: true,
    acceptedFiles: "image/*",
    removedfile: function (file) {
        deleteMedia(file.id)
        var index = thumbnailIDArray.findIndex(item => item === file.id)
        console.log('thumbnailArray', thumbnailArray)
        file.previewElement.remove();
        thumbnailArray.splice(index, 1);
        thumbnailIDArray.splice(index, 1);

    },

    init: function () {

        this.on("success", function (file, response) {
            console.log('response', response)
            thumbnailIDArray.push(response.data.id)
            file.id = response.data.id;

            console.log(thumbnailIDArray);
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

// Choices.js ile multiple select özelliği ekleyelim
const selectCategory2 = new Choices('#choices-category-input-2', {
    removeItemButton: true,
    searchEnabled: true,
    placeholder: true,
    placeholderValue: 'Kategori seçin'
});


//Category List
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    var json_records = JSON.parse(this.responseText);
    Array.from(json_records).forEach(function (element) {

        categories.push(element);

    });

    let copyCategories=[]

    categories.forEach(category => {

        copyCategories.push({ value: category.id, label: category.name })
    });

    selectCategory2.setChoices(copyCategories, 'value', 'label', false);
}
xhttp.open("GET", "/Yonetici/api/categories.php");
xhttp.send();


const productID = document.getElementById('product-id-input').value

//Product Detail
const xhttp_product = new XMLHttpRequest();
xhttp_product.onload = function () {
    var json_records = JSON.parse(this.responseText);
    const data = json_records.data
    console.log(data)


    document.getElementById('product-title-input').value = data.title
    document.getElementById('product-sentence-input').value = data.sentence
    document.getElementById('youtube_url').value = data.youtube_url
    document.getElementById('stocks-input').value = data.stock
    document.getElementById('product-price-input').value = data.price
    document.getElementById('product-discount-input').value = data.discount
    document.getElementById('product-url-input').value = data.link
    document.getElementById('product-hover-media-id-input').value = data.hover_photo_id;


    if (data.tags) {
        tags.setValue(data.tags.split(','));
    } else {
        tags.setValue([]); // Eğer tags boşsa, boş bir dizi set edilsin
    }
    variations = data.variations
    variations2 = data.variations

    dropdowns = data.dropdowns

    setTimeout(() => {

        let similarProductsData = data.recommendations
            .filter(rec => rec.recommendation_type === "similar")
            .map(rec => similarProducts.setChoiceByValue(rec.product_id.toString()));

        let relatedProductsData = data.recommendations
            .filter(rec => rec.recommendation_type === "related")
            .map(rec => relatedProducts.setChoiceByValue(rec.product_id.toString()));

    }, 2000)

    const groupedVariations = {};


    variations2.forEach(variation => {
        const { variation_name, attribute_name, discount, price, content, stock } = variation;


        if (!groupedVariations[variation_name]) {
            groupedVariations[variation_name] = {
                variation_name,
                attributes: []
            };
        }

        groupedVariations[variation_name].attributes.push({
            attribute_name,
            discount,
            price,
            content,
            stock
        });
    });

    resultVariationsArray = Object.values(groupedVariations);

    console.log(resultVariationsArray);

    resultVariationsArray.forEach((variation, index) => {
        const tabId = `variation-tab-${index}`;
        const tabContentId = `variation-content-${index}`;

        const tabHtml = `
    <li class="nav-item d-flex align-items-center" role="presentation">
        <a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}" data-bs-toggle="tab" href="#${tabContentId}" role="tab" aria-controls="${tabContentId}" aria-selected="${index === 0}">
            ${variation.variation_name || `Varyasyon ${index + 1}`}
           
        </a>
         <button type="button" class="btn btn-danger btn-sm ms-2 delete-variation-btn" id="delete-variation-${index}">
            Sil
        </button>
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
                        <input class="form-control" required name="variation-input-name" id="variation-input-name-${index}" type="text" value="${variation.variation_name || ''}">
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
            resultVariationsArray[index].variation_name = inputVal;
        });

        variation.attributes.forEach((attr, attrIndex) => {
            const detailsHtml = `
            <div id="extra-details-${index}-${attrIndex}" class="row">
                <div class="col-lg-2">
                    <div class="mt-3 mt-lg-0">
                        <label class="form-label" for="attribute-input-name-${index}-${attrIndex}">Nitelikleri</label>
                        <input class="form-control" required name="attribute-input-name" id="attribute-input-name-${index}-${attrIndex}" type="text" value="${attr.attribute_name || ''}">
                        <div class="invalid-feedback">Lütfen nitelik adı girin.</div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="stock-input-${index}-${attrIndex}">Stok Adedi</label>
                        <input type="text" class="form-control" id="stock-input-${index}-${attrIndex}" placeholder="Stok" required value="${attr.stock || ''}">
                        <div class="invalid-feedback">Lütfen stok sayısı girin.</div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="product-price-input-${index}-${attrIndex}">Fiyat</label>
                        <div class="input-group has-validation mb-3">
                            <span class="input-group-text" id="product-price-addon">₺</span>
                            <input type="text" class="form-control" id="product-price-input-${index}-${attrIndex}" placeholder="Enter price" aria-label="Price" aria-describedby="product-price-addon" required value="${attr.price || ''}">
                            <div class="invalid-feedback">Fiyat Girin.</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2 col-sm-6">
                    <div class="mb-3">
                        <label class="form-label" for="product-discount-input-${index}-${attrIndex}">İndirim</label>
                        <div class="input-group has-validation mb-3">
                            <span class="input-group-text" id="product-discount-addon">%</span>
                            <input type="text" class="form-control" id="product-discount-input-${index}-${attrIndex}" placeholder="Enter discount" aria-label="discount" aria-describedby="product-discount-addon" required value="${attr.discount || ''}">
                            <div class="invalid-feedback">İndirim girin.</div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2">
                    <div class="mt-3 mt-lg-0">
                        <label class="form-label" for="content-input-name-${index}-${attrIndex}">Açıklama</label>
                        <input class="form-control" name="content-input-name" id="content-input-name-${index}-${attrIndex}" type="text" value="${attr.content || ''}">
                    </div>
                </div>
                <div class="col-lg-1">
            <button type="button" class="btn btn-danger btn-sm delete-attribute-btn" id="delete-attribute-${index}-${attrIndex}">
                Sil
            </button>
        </div>
            </div>
        `;
            document.getElementById(`extra-details-wrapper-${index}`).insertAdjacentHTML('beforeend', detailsHtml);

            // Attach input event listeners to update `resultVariationsArray`
            document.getElementById(`attribute-input-name-${index}-${attrIndex}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[attrIndex].attribute_name = event.target.value;
            });

            document.getElementById(`stock-input-${index}-${attrIndex}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[attrIndex].stock = event.target.value;
            });

            document.getElementById(`product-price-input-${index}-${attrIndex}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[attrIndex].price = event.target.value;
            });

            document.getElementById(`product-discount-input-${index}-${attrIndex}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[attrIndex].discount = event.target.value;
            });

            document.getElementById(`content-input-name-${index}-${attrIndex}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[attrIndex].content = event.target.value;
            });

            document.getElementById(`delete-variation-${index}`).addEventListener('click', function () {

                resultVariationsArray.splice(index, 1);


                const tabElement = document.getElementById(`variation-tab-${index}`);
                const tabContentElement = document.getElementById(`variation-content-${index}`);

                if (tabElement) {
                    tabElement.parentElement.remove();
                }

                if (tabContentElement) {
                    tabContentElement.remove();
                }

                console.log('Variation silindi:', resultVariationsArray);
            });


            document.getElementById(`delete-attribute-${index}-${attrIndex}`).addEventListener('click', function () {
                resultVariationsArray[index].attributes.splice(attrIndex, 1);

                document.getElementById(`extra-details-${index}-${attrIndex}`).remove();
                console.log('Attribute silindi:', resultVariationsArray);
            });
        });

        document.getElementById(`add-details-${index}`).addEventListener('click', function () {
            const detailsCount = document.querySelectorAll(`#extra-details-wrapper-${index} .row`).length;

            const previousStock = document.getElementById(`stock-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousPrice = document.getElementById(`product-price-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousDiscount = document.getElementById(`product-discount-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousContent = document.getElementById(`content-input-name-${index}-${detailsCount - 1}`)?.value || '';

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

            resultVariationsArray[index].attributes.push({
                stock: previousStock,
                price: previousPrice,
                discount: previousDiscount,
                content: previousContent
            });

            document.getElementById(`delete-attribute-${index}-${detailsCount}`).addEventListener('click', function () {
                resultVariationsArray[index].attributes.splice(detailsCount, 1);

                document.getElementById(`extra-details-${index}-${detailsCount}`).remove();
                console.log('Attribute silindi:', resultVariationsArray);
            });

            document.getElementById(`attribute-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].attribute_name = event.target.value;
            });

            document.getElementById(`stock-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].stock = event.target.value;
            });

            document.getElementById(`product-price-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].price = event.target.value;
            });

            document.getElementById(`product-discount-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].discount = event.target.value;
            });

            document.getElementById(`content-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].content = event.target.value;
            });
        });






    });


    document.getElementById('add-variation-2').addEventListener('click', function () {
        resultVariationsArray.push({
            variation_name: '',
            attributes: [],
        });

        console.log(resultVariationsArray);
        const index = resultVariationsArray.length - 1;

        const tabId = `variation-tab-${index}`;
        const tabContentId = `variation-content-${index}`;
        const tabHtml = `
        <li class="nav-item nav-item d-flex align-items-center" role="presentation">
            <a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}" data-bs-toggle="tab" href="#${tabContentId}" role="tab" aria-controls="${tabContentId}" aria-selected="${index === 0}">
                Varyasyon ${index + 1}
              
            </a>
            <button type="button" class="btn btn-danger btn-sm ms-2 delete-variation-btn" id="delete-variation-${index}">
            Sil
        </button>
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
            resultVariationsArray[index].variation_name = inputVal;
        });

        document.getElementById(`delete-variation-${index}`).addEventListener('click', function () {

            resultVariationsArray.splice(index, 1);


            const tabElement = document.getElementById(`variation-tab-${index}`);
            const tabContentElement = document.getElementById(`variation-content-${index}`);

            if (tabElement) {
                tabElement.parentElement.remove();
            }

            if (tabContentElement) {
                tabContentElement.remove();
            }

            console.log('Variation silindi:', resultVariationsArray);
        });

        document.getElementById(`add-details-${index}`).addEventListener('click', function () {
            const detailsCount = document.querySelectorAll(`#extra-details-wrapper-${index} .row`).length;

            const previousStock = document.getElementById(`stock-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousPrice = document.getElementById(`product-price-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousDiscount = document.getElementById(`product-discount-input-${index}-${detailsCount - 1}`)?.value || '';
            const previousContent = document.getElementById(`content-input-name-${index}-${detailsCount - 1}`)?.value || '';

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

            resultVariationsArray[index].attributes.push({
                stock: previousStock,
                price: previousPrice,
                discount: previousDiscount,
                content: previousContent
            });

            document.getElementById(`delete-attribute-${index}-${detailsCount}`).addEventListener('click', function () {
                resultVariationsArray[index].attributes.splice(detailsCount, 1);

                document.getElementById(`extra-details-${index}-${detailsCount}`).remove();
                console.log('Attribute silindi:', resultVariationsArray);
            });

            document.getElementById(`attribute-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].attribute_name = event.target.value;
            });

            document.getElementById(`stock-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].stock = event.target.value;
            });

            document.getElementById(`product-price-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].price = event.target.value;
            });

            document.getElementById(`product-discount-input-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].discount = event.target.value;
            });

            document.getElementById(`content-input-name-${index}-${detailsCount}`).addEventListener('input', function (event) {
                resultVariationsArray[index].attributes[detailsCount].content = event.target.value;
            });
        });
    });



// Mevcut dropdown'ları yükleme
dropdowns.forEach((dropdown, index) => {
    // HTML kodunu oluştur
    const dropdownsHtmlContent = dropdownsHtml(index, dropdown);

    // Oluşturulan HTML'i dropdowns div'ine ekle
    document.getElementById('dropdowns').insertAdjacentHTML('beforeend', dropdownsHtmlContent);

    // CKEditor'i mevcut içerik alanı için başlatın
    ClassicEditor
        .create(document.querySelector(`#content-input-${index}`))
        .then(function (editor) {
            contentEditorInstances[`content-input-${index}`] = editor; // Yeni editor örneğini saklayın
            editor.ui.view.editable.element.style.height = '200px'; // CKEditor yüksekliği

            // CKEditor ile içerik yönetimi
            editor.model.document.on('change:data', () => {
                dropdowns[index].content = editor.getData();
            });
        })
        .catch(function (error) {
            console.error(error);
        });

    // Input alanlarına event listener ekleyin
    document.getElementById(`title-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].title = event.target.value;
    });

    document.getElementById(`order-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].order = event.target.value;
    });
});


    
    

    var mockFileCover = { id: data.cover_photo_id, size: 0, };
    featuredDropzone.options.addedfile.call(featuredDropzone, mockFileCover);
    featuredDropzone.options.thumbnail.call(featuredDropzone, mockFileCover, data.cover_image);
    featuredImageID = data.cover_photo_id

    var mockFileHover = { id: data.cover_hover_id, size: 0, };
    secondaryImageDropzone.options.addedfile.call(secondaryImageDropzone, mockFileHover);
    secondaryImageDropzone.options.thumbnail.call(secondaryImageDropzone, mockFileHover, data.hover_image);
    secondaryImageID = data.cover_hover_id



    data.images.map((image) => {
        thumbnailIDArray.push(image.id)
        thumbnailArray.push(image.folder_path)
        var mockFile = { id: image.id, size: 0, };
        myDropzone.options.addedfile.call(myDropzone, mockFile);
        myDropzone.options.thumbnail.call(myDropzone, mockFile, image.folder_path);
    })


    setTimeout(() => {
        const categoryIds = data.category_id.split(',').map(id => id.trim());

        console.log('Seçilen idler:', categoryIds);

        selectCategory2.setChoiceByValue(categoryIds);

        console.log('get', selectCategory2.getValue(true));
    
    }, 1500);



    // İlk editörü başlatın
    ClassicEditor
        .create(document.querySelector('#ckeditor-classic'))
        .then(function (editor) {
            contentEditor = editor;
            editor.setData(data.content);
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
            editor.setData(data.description);
            editor.ui.view.editable.element.style.height = '100px';
        })
        .catch(function (error) {
            console.error(error);
        });


}
xhttp_product.open("GET", "/Yonetici/api/products.php?id=" + productID);
xhttp_product.send();



// Dropdown HTML oluşturma fonksiyonu (ClassicEditor ile)
function dropdownsHtml(index, dropdown = null) {
    const dropdownHtml = `
    <hr>

     <div class="dropdown-container-${index}"style=" display: contents;">
           <div class="col-lg-4 col-sm-6 mb-3" style="width: 70%; margin-left: 10px; margin-right: 10px;">
            <label class="form-label" for="title-input-${index}">Başlık</label>
            <input type="text" class="form-control" id="title-input-${index}" placeholder="Başlık" required value="${dropdown ? dropdown.title : ''}">
            <div class="invalid-feedback">Lütfen Başlık girin.</div>
        </div>
        
        <div class="col-lg-4 col-sm-6 mb-3" style="width: 10%;">
            <label class="form-label" for="order-input-${index}">Sıra No</label>
            <input type="number" class="form-control" id="order-input-${index}" placeholder="Sıra No" required value="${dropdown ? dropdown.order : ''}">
            <div class="invalid-feedback">Lütfen Sıra No girin.</div>
        </div>
        <div class="dropdown-${index} col-lg-1 text-end">
            <div id="cancel-btn-dropdown-${index}" class="btn btn-danger cancel-btn" data-index="${index}">X</div>
        </div>       
        <div class="" style="width: 100%; margin-right: 10px; margin-left: 10px;">
            <div>
                <label class="form-label" for="content-input-${index}">İçerik</label>
                <textarea class="form-control" id="content-input-${index}" placeholder="İçerik" required>${dropdown ? dropdown.content : ''}</textarea>
                <div class="invalid-feedback">Lütfen İçerik girin.</div>
            </div>
        </div>
        </div>
        
    `;
    
    return dropdownHtml;
}



var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    var editinputValueJson = JSON.parse(editinputValueJson);
    document.getElementById("formAction").value = "edit";
    document.getElementById("product-id-input").value = editinputValueJson.id;
    productCategoryInput.setChoiceByValue(editinputValueJson.category);
    myDropzone.options.addedfile.call(myDropzone, mockFile);
    myDropzone.options.thumbnail.call(myDropzone, mockFile, editinputValueJson.productImg);
    thumbnailArray.push(editinputValueJson.productImg)
    document.getElementById("product-title-input").value = editinputValueJson.productTitle;
    document.getElementById("product-sentence-input").value = editinputValueJson.productSencente;

    document.getElementById("stocks-input").value = editinputValueJson.stock;
    document.getElementById("product-price-input").value = editinputValueJson.price;
    document.getElementById("product-discount-input").value = editinputValueJson.discount;
    document.getElementById("orders-input").value = editinputValueJson.orders;

    // clothe-colors
    Array.from(document.querySelectorAll(".clothe-colors li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        editinputValueJson.color.map(function (subItem) {
            if (subItem == nameelem.value) {
                nameelem.setAttribute("checked", "checked");
            }
        })
    })

    // clothe-size
    Array.from(document.querySelectorAll(".clothe-size li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        if (editinputValueJson.size) {
            editinputValueJson.size.map(function (subItem) {
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




document.addEventListener('click', function(event) {
    if (event.target.classList.contains('cancel-btn')) {
        const index = event.target.getAttribute('data-index');
        dropdowns.splice(index, 1);
        console.log('Dropdown', dropdowns);

        // Tüm "dropdown-container-" + index class'ına sahip div'leri seç
        const containers = document.querySelectorAll('.dropdown-container-' + index);

        // Her bir kapsayıcıyı döngü ile sil
        containers.forEach(container => container.remove());
    }
});





// function removeDropdown(index) {

//     dropdowns.splice(index, 1)
//     console.log('Dropdown', dropdowns)

//     // Tüm "my-div" class'ına sahip div'leri seç
//     var divs = document.getElementsByClassName('dropdown-' + index);

//     // HTMLCollection'ı diziye çevir
//     var divArray = Array.from(divs);

//     // Her bir div'i döngü ile sil
//     divArray.forEach(function (div) {
//         div.parentNode.removeChild(div);
//     });

// }





function removeVariation(index) {

    variations.splice(index, 1)
    console.log('variations', variations)

    // Tüm "my-div" class'ına sahip div'leri seç
    var divs = document.getElementsByClassName('variation-' + index);

    // HTMLCollection'ı diziye çevir
    var divArray = Array.from(divs);

    // Her bir div'i döngü ile sil
    divArray.forEach(function (div) {
        div.parentNode.removeChild(div);
    });

}


document.getElementById('add-dropdown').addEventListener('click', function () {
    // Boş bir dropdown nesnesi ekle
    dropdowns.push({
        title: '',
        content: '',
        order: ''
    });

    // dropdownun indexini al
    const index = dropdowns.length - 1;

    // HTML kodunu oluştur
    const dropdownHtml = dropdownsHtml(index);

    // Oluşturulan HTML'i dropdowns div'ine ekle
    document.getElementById('dropdowns').insertAdjacentHTML('beforeend', dropdownHtml);

    // CKEditor'i yeni içerik alanı için başlatın
    ClassicEditor
        .create(document.querySelector(`#content-input-${index}`))
        .then(function (editor) {
            contentEditorInstances[`content-input-${index}`] = editor; // Yeni editor örneğini saklayın
            editor.ui.view.editable.element.style.height = '200px'; // CKEditor yüksekliği

            // CKEditor ile içerik yönetimi
            editor.model.document.on('change:data', () => {
                dropdowns[index].content = editor.getData();
            });
        })
        .catch(function (error) {
            console.error(error);
        });

    // Input alanlarına event listener ekleyin
    document.getElementById(`title-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].title = event.target.value;
    });

    document.getElementById(`order-input-${index}`).addEventListener('input', function (event) {
        dropdowns[index].order = event.target.value;
    });
});



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
    const variationHtml = variation_temp(index)

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


Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const hoverID = parseInt(document.getElementById('product-hover-media-id-input').value, 10);
            console.log(hoverID);

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

            const content = contentEditor.getData();
            const description = descEditor.getData();
            var newCategoryInput = document.getElementById('new_category').value.trim();


            const formData = {
                id: productID,
                cover_image: featuredImageID,
                hover_image: secondaryImageID == null ? hoverID : secondaryImageID,
                title: document.getElementById('product-title-input').value,
                sentence: document.getElementById('product-sentence-input').value,
                youtube_url: document.getElementById('youtube_url').value,
                link: productUrl,
                content: content,
                desc: description,
                price: document.getElementById('product-price-input').value,
                discount: document.getElementById('product-discount-input').value,
                stock: document.getElementById('stocks-input').value,
                images: thumbnailIDArray,
                variations: resultVariationsArray,
                dropdowns: dropdowns,
                tags: tags.getValue(true).join(','),
                similarProducts: similarProducts.getValue(true),
                relatedProducts: relatedProducts.getValue(true),
                new_category: newCategoryInput,
                category_ids: Array.from(document.getElementById('choices-category-input-2').selectedOptions).map(option => parseInt(option.value)).join(',')  // Virgülle ayırarak string'e dönüştürüyoruz

            }
            console.log('data', formData)

            const xhttp_createPage = new XMLHttpRequest();
            xhttp_createPage.onload = function () {
                if (this.status === 201 || this.status === 200) {
                    alert('Ürün Güncellendi!')
                    setTimeout(function () {
                        window.location.href = "/Yonetici/product-list.php";
                    }, 2000);
                } else {
                    alert('Ürün Güncellenemedi!')
                }
            };
            xhttp_createPage.onerror = function () {
                alert('hata')
            };
            xhttp_createPage.open("POST", "/Yonetici/api/products.php?id=" + productID);
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

