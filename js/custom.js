(function() {
	'use strict';

	var allProducts = [];
	var searchDelay = null;

	var normalizeText = function(value) {
		return (value || '').toString().trim().toLowerCase();
	};

	var getProductCategory = function(product) {
		var title = normalizeText(product.title);

		if (/relax|lounge|comfort|recliner/.test(title)) {
			return 'lounge';
		}

		if (/executive|task|mesh|aero|office/.test(title)) {
			return 'office';
		}

		if (/dining|cushioned|classic|upholstered/.test(title)) {
			return 'dining';
		}

		if (/oak|wood|wooden|nordic|scandi/.test(title)) {
			return 'wooden';
		}

		if (/minimal|modern|studio|contemporary|accent/.test(title)) {
			return 'modern';
		}

		return 'accent';
	};

	var getCategoryLabel = function(category) {
		var labels = {
			all: 'All categories',
			wooden: 'Wooden',
			office: 'Office',
			lounge: 'Lounge',
			modern: 'Modern',
			dining: 'Dining',
			accent: 'Accent'
		};

		return labels[category] || category;
	};

	var tinyslider = function() {
		var el = document.querySelectorAll('.testimonial-slider');

		if (el.length > 0) {
			var slider = tns({
				container: '.testimonial-slider',
				items: 1,
				axis: "horizontal",
				controlsContainer: "#testimonial-nav",
				swipeAngle: false,
				speed: 700,
				nav: true,
				controls: true,
				autoplay: true,
				autoplayHoverPause: true,
				autoplayTimeout: 3500,
				autoplayButtonOutput: false
			});
		}
	};
	tinyslider();

	


	var sitePlusMinus = function() {

		var value,
    		quantity = document.getElementsByClassName('quantity-container');

		function createBindings(quantityContainer) {
	      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
	      var increase = quantityContainer.getElementsByClassName('increase')[0];
	      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
	      increase.addEventListener('click', function (e) { increaseValue(e, quantityAmount); });
	      decrease.addEventListener('click', function (e) { decreaseValue(e, quantityAmount); });
	    }

	    function init() {
	        for (var i = 0; i < quantity.length; i++ ) {
						createBindings(quantity[i]);
	        }
	    };

	    function increaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        console.log(quantityAmount, quantityAmount.value);

	        value = isNaN(value) ? 0 : value;
	        value++;
	        quantityAmount.value = value;
	    }

	    function decreaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        value = isNaN(value) ? 0 : value;
	        if (value > 0) value--;

	        quantityAmount.value = value;
	    }
	    
	    init();
		
	};
	sitePlusMinus();

	var renderUI = function(products, emptyMessage) {
		var productGrid = document.getElementById('product-grid');

		if (!productGrid) {
			return;
		}

		// Clear the placeholder content first so the JSON data becomes the single source of truth.
		productGrid.innerHTML = '';

		if (!products.length) {
			var emptyState = document.createElement('div');
			emptyState.className = 'col-12';
			emptyState.innerHTML = '<div class="alert alert-light text-center mb-0 border">' + (emptyMessage || 'No matching products found.') + '</div>';
			productGrid.appendChild(emptyState);
			return;
		}

		// Each object in the JSON array becomes one Bootstrap column containing one product card.
		products.forEach(function(product) {
			var column = document.createElement('div');
			column.className = 'col-12 col-md-4 col-lg-3 mb-5';

			var productLink = document.createElement('a');
			productLink.className = 'product-item';
			productLink.href = product.href || '#';

			var image = document.createElement('img');
			image.src = product.image;
			image.alt = product.title;
			image.className = 'img-fluid product-thumbnail';

			var title = document.createElement('h3');
			title.className = 'product-title';
			title.textContent = product.title;

			var price = document.createElement('strong');
			price.className = 'product-price';
			price.textContent = '$' + Number(product.price).toFixed(2);

			var cross = document.createElement('span');
			cross.className = 'icon-cross';

			var crossImage = document.createElement('img');
			crossImage.src = product.crossIcon || 'images/cross.svg';
			crossImage.alt = '';
			crossImage.className = 'img-fluid';

			cross.appendChild(crossImage);
			productLink.appendChild(image);
			productLink.appendChild(title);
			productLink.appendChild(price);
			productLink.appendChild(cross);
			column.appendChild(productLink);
			productGrid.appendChild(column);
		});
	};

	var renderFilteredProducts = function() {
		var searchInput = document.getElementById('search-input');
		var categorySelect = document.getElementById('category-select');

		if (!allProducts.length || !searchInput || !categorySelect) {
			return;
		}

		var keyword = normalizeText(searchInput.value);
		var category = categorySelect.value || 'all';

		if (!keyword && category === 'all') {
			renderUI(allProducts);
			return;
		}

		var filteredProducts = allProducts.filter(function(product) {
			var title = normalizeText(product.title);
			var productCategory = getProductCategory(product);
			var keywordMatches = !keyword || title.indexOf(keyword) !== -1 || getCategoryLabel(productCategory).toLowerCase().indexOf(keyword) !== -1;
			var categoryMatches = category === 'all' || productCategory === category;

			return keywordMatches && categoryMatches;
		});

		renderUI(filteredProducts, 'No matching products found.');
	};

	var bindFilterControls = function() {
		var searchInput = document.getElementById('search-input');
		var categorySelect = document.getElementById('category-select');
		var resetButton = document.getElementById('reset-filters');

		if (!searchInput || !categorySelect || !resetButton) {
			return;
		}

		searchInput.addEventListener('input', function() {
			window.clearTimeout(searchDelay);
			searchDelay = window.setTimeout(renderFilteredProducts, 1000);
		});
		categorySelect.addEventListener('change', renderFilteredProducts);
		resetButton.addEventListener('click', function() {
			window.clearTimeout(searchDelay);
			searchInput.value = '';
			categorySelect.value = 'all';
			renderFilteredProducts();
			searchInput.focus();
		});
	};

	var requestProducts = function() {
		var productsPath = 'data/products.json';

		// This function represents the network request step in the sequence diagram.
		// It asks for the JSON file, converts the response into JavaScript objects,
		// and then passes those objects to the rendering function.
		fetch(productsPath)
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Failed to load products.');
				}

				return response.json();
			})
			.then(function(products) {
				allProducts = products;
				bindFilterControls();
				renderFilteredProducts();
			})
			.catch(function() {
				var productGrid = document.getElementById('product-grid');

				if (productGrid) {
					productGrid.innerHTML = '<div class="col-12"><p class="text-center mb-0">Products could not be loaded.</p></div>';
				}
			});
	};

	// Start the product loading flow when this script runs.
	// requestProducts() is the entry point, fetch() gets the JSON data,
	// and renderUI() converts that data into visible product cards.
	requestProducts();


})()