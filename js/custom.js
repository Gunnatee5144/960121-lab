(function() {
	'use strict';

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

	var renderUI = function(products) {
		var productGrid = document.getElementById('product-grid');

		if (!productGrid) {
			return;
		}

		// Clear the placeholder content first so the JSON data becomes the single source of truth.
		productGrid.innerHTML = '';

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
				renderUI(products);
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