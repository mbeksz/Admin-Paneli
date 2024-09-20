/*
Template Name: Toner eCommerce + Admin HTML Template
Author: Themesbrand
Version: 1.2.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Product-grid init File
*/




var prevButton = document.getElementById('page-prev');
var nextButton = document.getElementById('page-next');
var currentPage = 1;
var itemsPerPage = 6;

// Slider List
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    var json_records = JSON.parse(this.responseText);
    var productListData = [];

    Array.from(json_records).forEach(function (element) {
        console.log('element', element);
      
        
        // Add element data to productListData array
        productListData.push({
            id: element.id,
            productImg: "assets/images/products/slider-pp.jpg",
            productTitle: element.name
        });

    });
    

    // Load the product list with the fetched data
    loadProductList(productListData);
}
xhttp.open("GET", "/Yonetici/api/sliders.php");
xhttp.send();

function loadProductList(datas) {
    document.getElementById("product-grid").innerHTML = "";
    datas.forEach(function (data) {
        document.getElementById("product-grid").innerHTML += `
            <div class="col-lg-4 col-sm-6">
                <div class="card ecommerce-product-widgets overflow-hidden">
                    <div class="card-body">
                        <div class="bg-light rounded py-5 position-relative">
                            <div class="dropdown action">
                                <button class="btn btn-soft-secondary btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="ph-dots-three-outline"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/Yonetici/slider-grid-edit.php?id=${data.id}">Duzenle</a></li>
                                </ul>
                            </div>
                            <img src="${data.productImg}" alt="" style="max-height: 150px; max-width: 100%;" class="mx-auto d-block rounded-2">
                        </div>
                        <div class="mt-3">
                            <a href="/Yonetici/slider-grid-edit.php?id=${data.id}">
                                <h6 class="fs-16 text-capitalize lh-base text-truncate mb-0">${data.productTitle}</h6>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    
    // Placeholder for pagination functionality
    selectedPage();
    currentPage == 1 ? prevButton.parentNode.classList.add('disabled') : prevButton.parentNode.classList.remove('disabled');
    currentPage == pages ? nextButton.parentNode.classList.add('disabled') : nextButton.parentNode.classList.remove('disabled');
}

// Placeholder functions and variables to avoid errors
function selectedPage() {
    // Your pagination logic here
}

var currentPage = 1; // Example value, adjust as needed
var pages = 1; // Example value, adjust as needed
var prevButton = document.createElement('button'); // Placeholder button
var nextButton = document.createElement('button'); // Placeholder button
prevButton.parentNode = document.createElement('div'); // Placeholder div
nextButton.parentNode = document.createElement('div'); // Placeholder div



// Search product list
var searchProductList = document.getElementById("searchProductList");
searchProductList.addEventListener("keyup", function () {
    var inputVal = searchProductList.value.toLowerCase();
    function filterItems(arr, query) {
        return arr.filter(function (el) {
            return el.productTitle.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
    }
    var filterData = filterItems(productListData, inputVal);
    searchResult(filterData);
    loadProductList(filterData, currentPage);
});

//  category list filter
Array.from(document.querySelectorAll('.filter-list a')).forEach(function (filteritem) {
    filteritem.addEventListener("click", function () {
        var filterListItem = document.querySelector(".filter-list a.active");
        if (filterListItem) filterListItem.classList.remove("active");
        filteritem.classList.add('active');

        var filterItemValue = filteritem.querySelector(".listname").innerHTML
        var filterData = productListData.filter(filterlist => filterlist.category === filterItemValue);

        searchResult(filterData);
        loadProductList(filterData, currentPage);
    });
});


// price range slider
var slider = document.getElementById('product-price-range');
if (slider) {
    noUiSlider.create(slider, {
        start: [0, 2000], // Handle start position
        step: 10, // Slider moves in increments of '10'
        margin: 20, // Handles must be more than '20' apart
        connect: true, // Display a colored bar between the handles
        behaviour: 'tap-drag', // Move handle on tap, bar is draggable
        range: { // Slider can select '0' to '100'
            'min': 0,
            'max': 2000
        },
        format: wNumb({ decimals: 0, prefix: '$ ' })
    });

    var minCostInput = document.getElementById('minCost'),
        maxCostInput = document.getElementById('maxCost');

    var filterDataAll = '';

    // When the slider value changes, update the input and span
    slider.noUiSlider.on('update', function (values, handle) {
        var productListupdatedAll = productListData;

        if (handle) {
            maxCostInput.value = values[handle];

        } else {
            minCostInput.value = values[handle];
        }

        var maxvalue = maxCostInput.value.substr(2);
        var minvalue = minCostInput.value.substr(2);
        filterDataAll = productListupdatedAll.filter(
            product => parseFloat(product.price) >= minvalue && parseFloat(product.price) <= maxvalue
        );

        searchResult(filterDataAll);
        loadProductList(filterDataAll, currentPage);
    });

    minCostInput.addEventListener('change', function () {
        slider.noUiSlider.set([null, this.value]);
    });

    maxCostInput.addEventListener('change', function () {
        slider.noUiSlider.set([null, this.value]);
    });
}

// color-filter
document.querySelectorAll("#color-filter li").forEach(function (item) {
    var inputVal = item.querySelector("input[type='radio']").value;
    item.querySelector("input[type='radio']").addEventListener("change", function () {

        var filterData = productListData.filter(function (filterlist) {
            if (filterlist.color) {
                return filterlist.color.some(function (g) {
                    return g == inputVal;
                });
            }
        });

        searchResult(filterData);
        loadProductList(filterData, currentPage);

    });
});

// size-filter
document.querySelectorAll("#size-filter li").forEach(function (item) {
    var inputVal = item.querySelector("input[type='radio']").value;
    item.querySelector("input[type='radio']").addEventListener("change", function () {

        var filterData = productListData.filter(function (filterlist) {
            if (filterlist.size) {
                return filterlist.size.some(function (g) {
                    return g == inputVal;
                });
            }
        });

        searchResult(filterData);
        loadProductList(filterData, currentPage);
    });
});

// discount-filter
var arraylist = [];
document.querySelectorAll("#discount-filter .form-check").forEach(function (item) {
    var inputVal = item.querySelector(".form-check-input").value;
    item.querySelector(".form-check-input").addEventListener("change", function () {
        if (item.querySelector(".form-check-input").checked) {
            arraylist.push(inputVal);
        } else {
            arraylist.splice(arraylist.indexOf(inputVal), 1);
        }

        var filterproductdata = productListData;
        if (item.querySelector(".form-check-input").checked && inputVal == 0) {
            filterDataAll = filterproductdata.filter(function (product) {
                if (product.discount) {
                    var listArray = product.discount.split("%");

                    return parseFloat(listArray[0]) < 10;
                }
            });
        } else if (item.querySelector(".form-check-input").checked && arraylist.length > 0) {
            var compareval = Math.min.apply(Math, arraylist);
            filterDataAll = filterproductdata.filter(function (product) {
                if (product.discount) {
                    var listArray = product.discount.split("%");
                    return parseFloat(listArray[0]) >= compareval;
                }
            });
        } else {
            filterDataAll = productListData;
        }

        searchResult(filterDataAll);
        loadProductList(filterDataAll, currentPage);
    });
});



// rating-filter
document.querySelectorAll("#rating-filter .form-check").forEach(function (item) {
    var inputVal = item.querySelector(".form-check-input").value;
    item.querySelector(".form-check-input").addEventListener("change", function () {
        if (item.querySelector(".form-check-input").checked) {
            arraylist.push(inputVal);
        } else {
            arraylist.splice(arraylist.indexOf(inputVal), 1);
        }

        var filterproductdata = productListData;
        if (item.querySelector(".form-check-input").checked && inputVal == 1) {
            filterDataAll = filterproductdata.filter(function (product) {
                if (product.rating) {
                    var listArray = product.rating;
                    return parseFloat(listArray) == 1;
                }
            });
        } else if (item.querySelector(".form-check-input").checked && arraylist.length > 0) {
            var compareval = Math.min.apply(Math, arraylist);
            filterDataAll = filterproductdata.filter(function (product) {
                if (product.rating) {
                    var listArray = product.rating;
                    return parseFloat(listArray) >= compareval;
                }
            });
        } else {
            filterDataAll = productListData;
        }

        searchResult(filterDataAll);
        loadProductList(filterDataAll, currentPage);
    });
});

function searchResult(data) {
    if (data.length == 0) {
        document.getElementById("pagination-element").style.display = "none";
        document.getElementById("search-result-elem").classList.remove("d-none");
    } else {
        document.getElementById("pagination-element").style.display = "flex";
        document.getElementById("search-result-elem").classList.add("d-none");
    }

    var pageNumber = document.getElementById('page-num');
    pageNumber.innerHTML = "";
    var dataPageNum = Math.ceil(data.length / itemsPerPage)
    // for each page
    for (var i = 1; i < dataPageNum + 1; i++) {
        pageNumber.innerHTML += "<div class='page-item'><a class='page-link clickPageNumber' href='javascript:void(0);'>" + i + "</a></div>";
    }
}