
let categories = [];


document.addEventListener('DOMContentLoaded', function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.status === 200) {
            try {
                categories = JSON.parse(this.responseText);
                console.log('Kategoriler:', categories);
                // Kategoriler yüklendikten sonra parent_id seçmeli kutusunu doldur
                populateParentSelect(categories);
                // Kategoriler yüklendikten sonra listeyi güncelle
                loadcategoryList(categories, currentPage);
            } catch (e) {
                console.error('Failed to parse categories response:', e);
            }
        } else {
            console.error('Failed to fetch categories:', this.status);
        }
    };
    xhttp.onerror = function () {
        console.error('Request error');
    };
    xhttp.open("GET", `/Yonetici/api/categories.php`);
    xhttp.send();
    
    // category-clear-btn düğmesine tıklandığında clearVal fonksiyonunu çağır
    document.getElementById('category-clear-btn').addEventListener('click', clearVal);
    

});

// parent_id seçmeli kutusunu dolduran fonksiyon
function populateParentSelect(categories) {
    var parentSelect = document.getElementById("parent_id");
    parentSelect.innerHTML = ''; // Mevcut seçenekleri temizle
    var defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Ana kategori Seçin";
    parentSelect.appendChild(defaultOption);

    categories.forEach(function (category) {
        var option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.title;
        parentSelect.appendChild(option);
    });
}

function editCategoryList() {
    var getEditid = 0;
    Array.from(document.querySelectorAll(".edit-list")).forEach(function (elem) {
        elem.addEventListener('click', function (event) {
            getEditid = elem.getAttribute('data-edit-id');
            categories = categories.map(function (item) {
                if (item.id == getEditid) {
                    editlist = true;
                    document.getElementById("categoryid-input").value = item.id;
                    document.getElementById('categoryTitle').value = item.title;
                    document.getElementById("categoryUrl").value = item.url;
                    document.getElementById("nameCategory").value = item.name;

                    // Parent ID seçmeli kutusunu doldur ve seçili hale getir
                    populateParentSelect(categories);

                    // Parent ID değerini seçili hale getir
                    var parentSelect = document.getElementById("parent_id");
                    if (item.parent_id) {
                        parentSelect.value = item.parent_id;
                    } else {
                        parentSelect.value = "";
                    }

                    document.getElementById('category-title-h6').innerText = "Kategori Düzenle";
                    document.getElementById('category-edit-btn').innerText = "Kategori Güncelle";
                    document.getElementById('category-clear-div').style.display = "block";

                    document.getElementById('categoryid-input').value = getEditid;
                }
                return item;
            });
        });
    });
}



var prevButton = document.getElementById('page-prev');
var nextButton = document.getElementById('page-next');
var currentPage = 1;
var itemsPerPage = 9;
paginationEvents(); 

function loadcategoryList(datas, page) {
    var pages = Math.ceil(datas.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > pages) page = pages;
    document.getElementById("categories-list").innerHTML = "";
    for (var i = (page - 1) * itemsPerPage; i < (page * itemsPerPage) && i < datas.length; i++) {
        if (datas[i]) {
            var showElem = 4;
            document.getElementById("categories-list").innerHTML += '<div class="col-xl-4 col-md-6">\
                    <div class="card card-height-100 categrory-widgets overflow-hidden">\
                        <div class="card-body p-4">\
                            <div class="d-flex align-items-center mb-3">\
                                <div class="flex-grow-1">\
                                    <h5 class="mb-0">Başlık: '+ datas[i].title + '</h5>\
                                    <h6 class="mb-0">URL: '+ datas[i].url + '</h6>\
                                </div>\
                                <ul class="flex-shrink-0 list-unstyled hstack gap-1 mb-0">\
                                    <li><a href="#!" class="badge bg-info-subtle text-info edit-list" data-edit-id="'+ datas[i].id + '">Düzenle</a></li>\
                                </ul>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
        }
    }

    selectedPage();
    currentPage == 1 ? prevButton.parentNode.classList.add('disabled') : prevButton.parentNode.classList.remove('disabled');
    currentPage == pages ? nextButton.parentNode.classList.add('disabled') : nextButton.parentNode.classList.remove('disabled');
    editCategoryList();
    removeItem();
    overViewList();
}


function selectedPage() {
    var pagenumLink = document.getElementById('page-num').getElementsByClassName('clickPageNumber');
    for (var i = 0; i < pagenumLink.length; i++) {
        if (i == currentPage - 1) {
            pagenumLink[i].parentNode.classList.add("active");
        } else {
            pagenumLink[i].parentNode.classList.remove("active");
        }
    }
};

// paginationEvents
function paginationEvents() {
    var numPages = function numPages() {
        return Math.ceil(categories.length / itemsPerPage);
    };

    function clickPage() {
        document.addEventListener('click', function (e) {
            if (e.target.nodeName == "A" && e.target.classList.contains("clickPageNumber")) {
                currentPage = e.target.textContent;
                loadcategoryList(categories, currentPage);
            }
        });
    };

    function pageNumbers() {
        var pageNumber = document.getElementById('page-num');
        pageNumber.innerHTML = "";
        // for each page
        for (var i = 1; i < numPages() + 1; i++) {
            pageNumber.innerHTML += "<div class='page-item'><a class='page-link clickPageNumber' href='javascript:void(0);'>" + i + "</a></div>";
        }
    }

    prevButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadcategoryList(categories, currentPage);
        }
    });

    nextButton.addEventListener('click', function () {
        if (currentPage < numPages()) {
            currentPage++;
            loadcategoryList(categories, currentPage);
        }
    });

    pageNumbers();
    clickPage();
    selectedPage();
}



var editlist = false;



var createCategoryForm = document.querySelectorAll('.createCategory-form');
Array.prototype.slice.call(createCategoryForm).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (form.checkValidity()) {
            var inputTitle = document.getElementById('categoryTitle').value;
            var url = document.getElementById('categoryUrl').value; 
            var parent_id = document.getElementById("parent_id").value;
            var name = document.getElementById("nameCategory").value;
            var category_input_id = document.getElementById("categoryid-input").value;

            var categoryData = {
                'id': category_input_id,
                "url": url,
                "categoryTitle": inputTitle,
                "name": name,
                "parent_id": parent_id,
            };

            var xhttp_createCategory = new XMLHttpRequest();
            xhttp_createCategory.onload = function () {
                if (this.status === 201) {
                    alert('Kategori işlemi başarıyla tamamlandı!');
                    setTimeout(function () {
                        window.location.href = "/Yonetici/categories.php";
                    }, 1000);
                } else {
                    alert('Kategori işlemi sırasında bir hata oluştu!');
                }
            };
            xhttp_createCategory.onerror = function () {
                alert('İstek sırasında bir hata oluştu!');
            };

            if (category_input_id) {
                // Kategori düzenleme
                xhttp_createCategory.open("POST", "/Yonetici/api/categories.php?id=" + category_input_id);
            } else {
                // Yeni kategori oluşturma
                xhttp_createCategory.open("POST", "/Yonetici/api/categories.php");
            }

            xhttp_createCategory.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createCategory.send(JSON.stringify(categoryData));
            
            // Kategoriyi kategorilere ekle veya güncelle
            if (category_input_id) {
                // Kategoriyi güncelleme
                categories = categories.map(function (item) {
                    if (item.id === category_input_id) {
                        return {
                            'id': category_input_id,
                            "url": url,
                            "categoryTitle": inputTitle,
                            "name": item.name,
                            "parent_id": parent_id,
                        };
                    } else {
                        return item;
                    }
                });
            } else {
                // Yeni kategori ekleme
                categories.push(categoryData);
            }
            
            searchResult(categories);
            loadcategoryList(categories, currentPage);
            clearVal();
            form.classList.remove('was-validated');

        } else {
            form.classList.add('was-validated');
        }
        
        sortElementsById();
    }, false);
});


function searchResult(data) {
    if (data.length == 0) {
        document.getElementById("pagination-element").style.display = "none";
        // document.getElementById("search-result-elem").classList.remove("d-none");
    } else {
        document.getElementById("pagination-element").style.display = "flex";
        // document.getElementById("search-result-elem").classList.add("d-none");
    }

    var pageNumber = document.getElementById('page-num');
    pageNumber.innerHTML = "";
    var dataPageNum = Math.ceil(data.length / itemsPerPage)
    // for each page
    for (var i = 1; i < dataPageNum + 1; i++) {
        pageNumber.innerHTML += "<div class='page-item'><a class='page-link clickPageNumber' href='javascript:void(0);'>" + i + "</a></div>";
    }
}


function fetchIdFromObj(category) {
    return parseInt(category.id);
}

function findNextId() {
    if (categories.length === 0) {
        return 0;
    }
    var lastElementId = fetchIdFromObj(categories[categories.length - 1]),
        firstElementId = fetchIdFromObj(categories[0]);
    return (firstElementId >= lastElementId) ? (firstElementId + 1) : (lastElementId + 1);
}

function sortElementsById() {
    var manyCategory = categories.sort(function (a, b) {
        var x = fetchIdFromObj(a);
        var y = fetchIdFromObj(b);

        if (x > y) {
            return -1;
        }
        if (x < y) {
            return 1;
        }
        return 0;
    })
    loadcategoryList(manyCategory, currentPage);
}
sortElementsById();



// overViewList
function overViewList() {
    var getViewid = 0;
    Array.from(document.querySelectorAll(".overview-btn")).forEach(function (elem) {
        elem.addEventListener('click', function (event) {
            getViewid = elem.getAttribute('data-view-id');
            categories = categories.map(function (item) {
                if (item.id == getViewid) {
                    document.querySelector('#overviewOffcanvas .overview-id').innerHTML = item.id;
                    document.querySelector('#overviewOffcanvas .overview-img').src = item.url;
                    document.querySelector('#overviewOffcanvas .overview-title').innerHTML = item.categoryTitle;
                    document.querySelector('#overviewOffcanvas .overview-desc').innerHTML = item.parent_id;
                    document.querySelector('#overviewOffcanvas .subCategory').innerHTML = item.name;
                    document.querySelector('#overviewOffcanvas .edit-list').setAttribute("data-edit-id", getViewid);
                    document.querySelector('#overviewOffcanvas .remove-list').setAttribute("data-remove-id", getViewid);
                }

                return item;
            });
        });
    });
}

// removeItem
function removeItem() {
    var getid = 0;
    Array.from(document.querySelectorAll(".remove-list")).forEach(function (item) {
        item.addEventListener('click', function (event) {
            getid = item.getAttribute('data-remove-id');
            document.getElementById("remove-category").addEventListener("click", function () {
                function arrayRemove(arr, value) {
                    return arr.filter(function (ele) {
                        return ele.id != value;
                    });
                }
                var filtered = arrayRemove(categories, getid);
                categories = filtered;
                searchResult(categories);
                loadcategoryList(categories, currentPage);
                document.getElementById("close-removecategoryModal").click();
            });
        });
    });
}

function clearVal() {
    document.getElementById('categoryTitle').value = "";
    document.getElementById("categoryUrl").value = "";
    document.getElementById("parent_id").value = "";
    document.getElementById("nameCategory").value = "";
      document.getElementById('categoryid-input').value = "";
     document.getElementById('category-title-h6').innerText = "Kategori Ekle";
    document.getElementById('category-edit-btn').innerText = "Kategori ekle";
    document.getElementById('category-clear-div').style.display = "none";

}