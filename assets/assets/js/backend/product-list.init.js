
var productListData = [];

var inputValueJson = sessionStorage.getItem('inputValue');
if (inputValueJson) {
    inputValueJson = JSON.parse(inputValueJson);
    Array.from(inputValueJson).forEach(element => {
        productListData.push(element);
    });
}

var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    editinputValueJson = JSON.parse(editinputValueJson);
    productListData = productListData.map(function (item) {
        if (item.id == editinputValueJson.id) {
            return editinputValueJson;
        }
        return item;
    });
}
var productList = null;

function replaceProducts(){
    
// product-list
if (document.getElementById("product-list")) {
    productList = new gridjs.Grid({
        columns: [
            {
                name: '#',
                width: '40px',
                sort: {
                    enabled: false
                },
                data: (function (row) {
                    return gridjs.html('<div class="form-check checkbox-product-list">\
                            <input class="form-check-input" type="checkbox" value="'+ row.id + '" id="checkbox-' + row.id + '">\
                            <label class="form-check-label" for="checkbox-'+ row.id + '"></label>\
                        </div>');
                })
            },
            {
                name: 'ID',
                data: (function (row) {

                    return row.id
                }),
                width: '30px',
            },
            {
                name: 'Ürün Adı',
                data: (function (row) {

                    return gridjs.html('<div class="d-flex align-items-center">\
                            <div class="flex-shrink-0 me-2 avatar-sm">\
                                <div class="avatar-title bg-light rounded">\
                                    <img src="'+ row.cover_image + '" alt="" class="avatar-xs" />\
                                </div>\
                            </div>\
                            <div class="flex-grow-1">\
                                <h6 class="mb-1"><a href="product-edit.php?id='+row.id+'" class="d-block text-reset">'+ row.title + '</a></h6>\
                                <p class="mb-0 text-muted">Kategori : <span class="fw-medium">'+ row.category + '</span></p>\
                            </div>\
                        </div>');
                }),
                width: '400px',
            },
            {
                name: 'Stok',
                data:(function (row) {
                    return row.stock
                }),
                width: '94px',
            },
            {
                name: 'Stok Durumu',
                data: (function (row) {
                    return row.stock_type
                }),
                width: '80px',
            },
            {
                name: 'Fiyat',
                data: (function (row) {
                    var discount = row.discount;
                    var afterDiscount = row.unit_price - (row.unit_price * discount / 100);
                    if (discount > 0) {
                        var afterDiscountElem = '<div>' + afterDiscount.toFixed(2) + '₺ <span class="text-muted fs-14"><del>' + row.unit_price + '₺</del></span></div>'
                    } else {
                        var afterDiscountElem = '<div>' + row.unit_price + '₺</div>'
                    }
                    return gridjs.html(afterDiscountElem);
                }),
                width: '60px',
            },
            {
                name: 'Sipariş Adedi',
                data: (function (row) {
                    return row.order_count
                }),
                width: '84px',
            },
            {
                name: 'Güncelleme Tarihi',
                data: (function (row) {
                    return row.update_date
                }),
                width: '120px',
            }, 
            {
                name: '#',
                width: '80px',
                data: (function (row) {
                    return gridjs.html('<div class="text-center dropdown">\
                        <a href="javascript:void(0);" class="btn btn-ghost-primary btn-icon btn-sm" data-bs-toggle="dropdown" aria-expanded="false" class=""><i class="mdi mdi-dots-horizontal"></i></a>\
                        <ul class="dropdown-menu dropdown-menu-end">\
                            <li>\
                                <a class="dropdown-item" onClick="editProductList('+ row.id + ')" href="product-create.html"><i class="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit</a>\
                            </li>\
                            <li>\
                                <a class="dropdown-item remove-list" onClick="removeItem('+ row.id +')" data-bs-toggle="modal" href="#removeItemModal"><i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>Delete</a>\
                            </li>\
                        </ul>\
                    </div>');
                })
            },
        ],
        sort: true,
        pagination: {
            limit: 10
        },
        data: productListData,
    }).render(document.getElementById("product-list"));
};  
    
}




//Product List
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    var json_records = JSON.parse(this.responseText);  
        console.log(json_records)
        Array.from(json_records).forEach(function (element) {
            productListData.push(element);

        });
        replaceProducts();
}
xhttp.open("GET", "/Yonetici/api/products.php");
xhttp.send();

function isStatus(val) {
    switch (val) {
        case "In stock":
            return ('<span class="badge bg-success-subtle text-success  align-middle ms-1">' + val + '</span>');
        case "Out of stock":
            return ('<span class="badge bg-danger-subtle text-danger  align-middle ms-1">' + val + '</span>');
    }
}

// Search product list
var searchProductList = document.getElementById("searchProductList");

searchProductList.addEventListener("keyup", function () {
    var inputVal = searchProductList.value.toLowerCase();
    function filterItems(arr, query) {
        return arr.filter(function (el) {
            return el.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 
        })
    }
    var filterData = filterItems(productListData, inputVal);
    productList.updateConfig({
        data: filterData
    }).forceRender();
});



document.getElementById("addproduct-btn").addEventListener("click", function () {
    sessionStorage.setItem('editInputValue', "")
})


function editProductList(elem) {
    var getEditid = elem;
    productListData = productListData.map(function (item) {
        if (item.id == getEditid) {
            sessionStorage.setItem('editInputValue', JSON.stringify(item));
        }
        return item;
    });
};

// removeItem event
function removeItem(elem) {
    var getid = elem;
    document.getElementById("remove-product").addEventListener("click", function () {
        function arrayRemove(arr, value) {
            return arr.filter(function (ele) {
                return ele.id != value;
            });
        }
        var filtered = arrayRemove(productListData, getid);

        productListData = filtered;
        productList.updateConfig({
            data: productListData
        }).forceRender();

        document.getElementById("close-removeproductModal").click();
    });
}




    // Dosya seçici açılır
    document.getElementById('addproduct-btn-2').addEventListener('click', function(e) {
        e.preventDefault();  
        document.getElementById('excel-file').click();  
    });


    document.getElementById('excel-file').addEventListener('change', function() {
        var fileInput = document.getElementById('excel-file');
        var fileName = fileInput.files[0].name;  
        document.getElementById('file-name').textContent = fileName;  
        document.getElementById('file-info').style.display = 'flex';  
    });



document.getElementById('submit-btn').addEventListener('click', function(e) {
    e.preventDefault();  // Formun varsayılan gönderim işlemini engelle

    var formData = new FormData();
    var fileInput = document.getElementById('excel-file');
    
    if (fileInput.files.length === 0) {
        alert('Lütfen bir dosya seçin.');
        return;
    }

    formData.append('excel_file', fileInput.files[0]);  // Dosyayı formData'ya ekle

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/add-product-collepce.php', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            // Dosya başarıyla yüklendi
            alert('Dosya başarıyla yüklendi: ');
            console.log(xhr.responseText)
            document.getElementById('file-info').style.display = 'none';  // Dosya bilgilerini gizle
        } else {
            // Dosya yükleme başarısız oldu
            alert('Dosya yükleme başarısız oldu: ' );
                        console.log(xhr.responseText)

        }
    };

    xhr.onerror = function() {
        // AJAX isteği başarısız olursa
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    };

    xhr.send(formData); // Veriyi gönder
});
