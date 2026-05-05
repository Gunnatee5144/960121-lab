(function() {
	'use strict';

	var allProducts = [];
	var searchDelay = null;
	var filtersBound = false;
	var catalogBound = false;
	var cartBound = false;
	var checkoutBound = false;
	var CART_STORAGE_KEY = 'furni-cart';

	var loadCart = function() {
		if (!window.localStorage) {
			return {};
		}

		try {
			var storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

			if (!storedCart) {
				return {};
			}

			var parsedCart = JSON.parse(storedCart);

			if (!parsedCart || typeof parsedCart !== 'object' || Array.isArray(parsedCart)) {
				return {};
			}

			Object.keys(parsedCart).forEach(function(productId) {
				var quantity = parseInt(parsedCart[productId], 10);

				if (isNaN(quantity) || quantity <= 0) {
					delete parsedCart[productId];
					return;
				}

				parsedCart[productId] = quantity;
			});

			return parsedCart;
		} catch (error) {
			return {};
		}
	};

	var cart = loadCart();
	window.cart = cart;

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

	var getCatalogElement = function() {
		return document.getElementById('catalog') || document.getElementById('product-grid');
	};

	var getCartTableBody = function() {
		return document.getElementById('cart-items');
	};

	var getCartSummarySubtotal = function() {
		return document.getElementById('cart-subtotal');
	};

	var getCartSummaryTotal = function() {
		return document.getElementById('cart-total');
	};

	var getCartBadge = function() {
		return document.getElementById('cart-count');
	};

	var saveCart = function() {
		if (!window.localStorage) {
			return;
		}

		window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
	};

	var getCartItemCount = function() {
		return Object.keys(cart).reduce(function(total, productId) {
			var quantity = parseInt(cart[productId], 10);

			return total + (isNaN(quantity) ? 0 : quantity);
		}, 0);
	};

	var updateCartBadge = function() {
		var badge = getCartBadge();

		if (!badge) {
			return;
		}

		var itemCount = getCartItemCount();

		if (itemCount > 0) {
			badge.textContent = String(itemCount);
			badge.classList.remove('is-hidden');
		} else {
			badge.textContent = '0';
			badge.classList.add('is-hidden');
		}
	};

	var clearCart = function() {
		cart = {};
		window.cart = cart;
		saveCart();
		updateCartBadge();
		renderCartPage();
	};

	var getCheckoutCartItems = function() {
		return Object.keys(cart).map(function(productId) {
			var quantity = parseInt(cart[productId], 10);

			if (!productId || isNaN(quantity) || quantity <= 0) {
				return null;
			}

			return {
				productId: String(productId),
				quantity: quantity
			};
		}).filter(function(item) {
			return item !== null;
		});
	};

	var renderCheckoutFeedback = function(type, messages) {
		var feedback = document.getElementById('checkout-feedback');
		var list = Array.isArray(messages) ? messages : [messages];

		if (!feedback) {
			return;
		}

		if (!list.length || !list[0]) {
			feedback.innerHTML = '';
			return;
		}

		feedback.innerHTML = [
			'<div class="alert alert-' + type + ' mb-0">',
			'  <ul class="mb-0 ps-3">',
				list.map(function(message) {
					return '<li>' + String(message) + '</li>';
				}).join(''),
			'  </ul>',
			'</div>'
		].join('');
	};

	var handleCheckoutSubmit = function(event) {
		var emailField = document.getElementById('c_email_address');
		var cardField = document.getElementById('c_card_number');
		var cartItems = getCheckoutCartItems();

		if (!emailField || !cardField) {
			return;
		}

		event.preventDefault();

		if (!cartItems.length) {
			renderCheckoutFeedback('danger', ['Your cart is empty.']);
			return;
		}

		renderCheckoutFeedback('info', ['Saving your order...']);

		fetch('/api/checkout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: emailField.value,
				cardNumber: cardField.value,
				cartItems: cartItems
			})
		})
		.then(function(response) {
			return response.json().then(function(payload) {
				return {
					ok: response.ok,
					status: response.status,
					payload: payload
				};
			});
		})
		.then(function(result) {
			if (!result.ok) {
				var errorMessages = result.payload && result.payload.errors ? Object.keys(result.payload.errors).map(function(key) {
					return result.payload.errors[key];
				}) : [result.payload && result.payload.message ? result.payload.message : 'Unable to save order.'];

				renderCheckoutFeedback('danger', errorMessages);
				return;
			}

			clearCart();
			renderCheckoutFeedback('success', ['Order saved successfully. Redirecting to the thank you page...']);
			window.setTimeout(function() {
				window.location.href = 'thankyou.html';
			}, 700);
		})
		.catch(function() {
			renderCheckoutFeedback('danger', ['Unable to save order. Please try again.']);
		});
	};

	var bindCheckoutEvents = function() {
		var checkoutButton = document.getElementById('checkout-submit');

		if (!checkoutButton) {
			return;
		}

		checkoutButton.addEventListener('click', handleCheckoutSubmit);
	};

	if (!checkoutBound) {
		bindCheckoutEvents();
		checkoutBound = true;
	}

	updateCartBadge();

	var updateCart = function(productId, amount) {
		if (!productId) {
			return;
		}

		var currentAmount = parseInt(cart[productId], 10);
		var delta = typeof amount === 'number' ? amount : 1;
		var nextAmount = delta + (isNaN(currentAmount) ? 0 : currentAmount);

		if (nextAmount <= 0) {
			delete cart[productId];
		} else {
			cart[productId] = nextAmount;
		}

		saveCart();
		updateCartBadge();
	};

	var removeFromCart = function(productId) {
		if (!productId || !cart[productId]) {
			return;
		}

		delete cart[productId];
		saveCart();
		updateCartBadge();
	};

	var getProductById = function(productId) {
		for (var i = 0; i < allProducts.length; i++) {
			if (String(allProducts[i].id) === String(productId)) {
				return allProducts[i];
			}
		}

		return null;
	};

	var handleAddToCartClick = function(event) {
		var button = event.target.closest('button.add-tocart');
		var catalog = getCatalogElement();

		if (!button || !catalog || !catalog.contains(button)) {
			return;
		}

		// Prevent the click from following the product card link.
		event.preventDefault();

		// Use the button's data-id so each product increments its own cart entry.
		updateCart(button.dataset.id, 1);
		renderCartPage();
		updateCartBadge();
		console.log('Cart updated:', cart);
	};

	var bindCatalogEvents = function() {
		var catalog = getCatalogElement();

		if (!catalog) {
			return;
		}

		catalog.addEventListener('click', handleAddToCartClick);
	};

	var handleCartClick = function(event) {
		var actionButton = event.target.closest('[data-cart-action]');
		var cartTableBody = getCartTableBody();

		if (!actionButton || !cartTableBody || !cartTableBody.contains(actionButton)) {
			return;
		}

		event.preventDefault();

		var productId = actionButton.dataset.id;
		var action = actionButton.dataset.cartAction;

		if (action === 'increase') {
			updateCart(productId, 1);
		}

		if (action === 'decrease') {
			updateCart(productId, -1);
		}

		if (action === 'remove') {
			removeFromCart(productId);
		}

		renderCartPage();
	};

	var bindCartEvents = function() {
		var cartTableBody = getCartTableBody();

		if (!cartTableBody) {
			return;
		}

		cartTableBody.addEventListener('click', handleCartClick);
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
		var productGrid = getCatalogElement();

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

			var productLink = document.createElement('div');
			productLink.className = 'product-item';

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

			var addToCartButton = document.createElement('button');
			addToCartButton.type = 'button';
			addToCartButton.className = 'icon-cross add-tocart';
			addToCartButton.dataset.id = product.id;
			addToCartButton.setAttribute('aria-label', 'Add ' + product.title + ' to cart');

			var addToCartImage = document.createElement('img');
			addToCartImage.src = product.crossIcon || 'images/cross.svg';
			addToCartImage.alt = '';
			addToCartImage.className = 'img-fluid';

			addToCartButton.appendChild(addToCartImage);
			productLink.appendChild(image);
			productLink.appendChild(title);
			productLink.appendChild(price);
			productLink.appendChild(addToCartButton);
			column.appendChild(productLink);
			productGrid.appendChild(column);
		});
	};

	var renderCartPage = function() {
		var cartTableBody = getCartTableBody();
		var subtotalElement = getCartSummarySubtotal();
		var totalElement = getCartSummaryTotal();

		if (!cartTableBody || !subtotalElement || !totalElement) {
			return;
		}

		var cartItems = Object.keys(cart).map(function(productId) {
			var product = getProductById(productId);

			if (!product) {
				return null;
			}

			return {
				product: product,
				quantity: cart[productId]
			};
		}).filter(function(item) {
			return item !== null;
		});

		cartTableBody.innerHTML = '';

		if (!cartItems.length) {
			var emptyRow = document.createElement('tr');
			emptyRow.innerHTML = '<td colspan="6" class="text-center py-5">Your cart is empty.</td>';
			cartTableBody.appendChild(emptyRow);
			subtotalElement.textContent = '$0.00';
			totalElement.textContent = '$0.00';
			return;
		}

		var subtotal = 0;

		cartItems.forEach(function(item) {
			var lineTotal = Number(item.product.price) * item.quantity;
			subtotal += lineTotal;

			var row = document.createElement('tr');
			row.innerHTML = [
				'<td class="product-thumbnail"><img src="' + item.product.image + '" alt="' + item.product.title + '" class="img-fluid"></td>',
				'<td class="product-name"><h2 class="h5 text-black">' + item.product.title + '</h2></td>',
				'<td>$' + Number(item.product.price).toFixed(2) + '</td>',
				'<td>',
				'  <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">',
				'    <div class="input-group-prepend">',
				'      <button class="btn btn-outline-black" type="button" data-cart-action="decrease" data-id="' + item.product.id + '">&minus;</button>',
				'    </div>',
				'    <input type="text" class="form-control text-center quantity-amount" value="' + item.quantity + '" readonly>',
				'    <div class="input-group-append">',
				'      <button class="btn btn-outline-black" type="button" data-cart-action="increase" data-id="' + item.product.id + '">&plus;</button>',
				'    </div>',
				'  </div>',
				'</td>',
				'<td>$' + lineTotal.toFixed(2) + '</td>',
				'<td><button type="button" class="btn btn-black btn-sm" data-cart-action="remove" data-id="' + item.product.id + '">X</button></td>'
			].join('');

			cartTableBody.appendChild(row);
		});

		subtotalElement.textContent = '$' + subtotal.toFixed(2);
		totalElement.textContent = '$' + subtotal.toFixed(2);
		updateCartBadge();
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
		categorySelect.addEventListener('change', function() {
			window.clearTimeout(searchDelay);
			requestProducts(categorySelect.value);
		});
		resetButton.addEventListener('click', function() {
			window.clearTimeout(searchDelay);
			searchInput.value = '';
			categorySelect.value = 'all';
			requestProducts('all');
			searchInput.focus();
		});
	};

	var buildProductsPath = function(category, useApi) {
		var normalizedCategory = normalizeText(category || 'all');
		var productsPath = useApi ? '/api/products' : 'data/products.json';

		if (useApi && normalizedCategory && normalizedCategory !== 'all') {
			productsPath += '?category=' + encodeURIComponent(normalizedCategory);
		}

		return productsPath;
	};

	var loadProductsFromPath = function(category, productsPath, fallbackPath) {
		// Try the requested source first, then fall back to the static JSON file
		// if the browser is opened outside the Express server.
		return fetch(productsPath)
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Failed to load products.');
				}

				return response.json();
			})
			.catch(function(error) {
				if (!fallbackPath || fallbackPath === productsPath) {
					throw error;
				}

				return fetch(fallbackPath).then(function(response) {
					if (!response.ok) {
						throw error;
					}

					return response.json();
				});
			});
	};

	var requestProducts = function(category) {
		var useApi = window.location.protocol !== 'file:';
		var productsPath = buildProductsPath(category, useApi);
		var fallbackPath = buildProductsPath(category, !useApi);

		// This function represents the network request step in the sequence diagram.
		// It asks the Express route for the current category, converts the response
		// into JavaScript objects, and then passes those objects to the rendering flow.
		loadProductsFromPath(category, productsPath, fallbackPath)
			.then(function(products) {
				allProducts = products;
				if (!filtersBound) {
					bindFilterControls();
					filtersBound = true;
				}
				if (!catalogBound) {
					bindCatalogEvents();
					catalogBound = true;
				}
				if (!cartBound) {
					bindCartEvents();
					cartBound = true;
				}
				if (!checkoutBound) {
					bindCheckoutEvents();
					checkoutBound = true;
				}
				renderFilteredProducts();
				renderCartPage();
				updateCartBadge();
			})
			.catch(function() {
				var productGrid = getCatalogElement();

				if (productGrid) {
					productGrid.innerHTML = '<div class="col-12"><p class="text-center mb-0">Products could not be loaded.</p></div>';
				}
			});
	};

	// Start the product loading flow when this script runs.
	// requestProducts() is the entry point, fetch() calls the Express API,
	// and renderUI() converts that data into visible product cards.
	requestProducts('all');


})()
