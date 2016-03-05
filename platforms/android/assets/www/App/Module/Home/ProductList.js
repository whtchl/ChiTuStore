/// <reference path='../../../Scripts/typings/require.d.ts' />
define(["require", "exports", 'Application', 'Services/Shopping', 'knockout.mapping', 'knockout', 'Site'], function (require, exports, app, shopping, mapping, ko, site) {
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
        var node;
        var BRAND_NONE_NAME = '全部品牌';
        var scrollEnd = false;
        var model = {
            firstLoad: true,
            queryArguments: {
                brandId: null,
                categoryId: null,
                pageIndex: 0,
                searchText: null,
                sort: ko.observable(''),
                filter: ko.observable('')
            },
            resetQueryArguments: function () {
                model.queryArguments.brandId = null;
                model.queryArguments.categoryId = null;
                model.queryArguments.pageIndex = 0;
                model.queryArguments.sort('');
                model.queryArguments.filter('');
            },
            title: ko.observable(),
            isLoading: ko.observable(false),
            products: ko.observableArray(),
            brands: ko.observableArray(),
            back: function () {
                return app.back().fail(function () {
                    app.redirect('Home_Class');
                });
            },
            isFilteByCategory: ko.observable(),
            loadProducts: function (clear) {
                clear = (clear === undefined) ? true : clear;
                var args = $.extend({}, mapping.toJS(model.queryArguments));
                return shopping.getProducts(args).done(function (items, filter) {
                    if (clear == true)
                        model.products.removeAll();
                    for (var i = 0; i < items.length; i++) {
                        model.products.push(items[i]);
                    }
                });
            },
            sort: function (model, event) {
                var type = $(event.target).attr('data-type') || $(event.target).parent().attr('data-type');
                switch (type) {
                    case 'Default':
                        model.queryArguments.sort('');
                        break;
                    case 'SalesNumber':
                        model.queryArguments.sort('SalesNumber asc');
                        break;
                    case 'Price':
                        if (model.queryArguments.sort() == 'Price asc') {
                            model.queryArguments.sort('Price desc');
                        }
                        else {
                            model.queryArguments.sort('Price asc');
                        }
                        break;
                }
                model.queryArguments.pageIndex = 0;
                model.products.removeAll();
                return scroll_view.on_load({});
            },
            showFilterDialog: function (model, event) {
                loadFilterDialog.done(function (filterDialog) {
                    filterDialog.brands(model.brands());
                    filterDialog.filter.minPrice(null);
                    filterDialog.filter.maxPrice(null);
                    filterDialog.show();
                    filterDialog.event = event;
                });
            }
        };
        var loadFilterDialog = $.Deferred();
        requirejs(['mod/Home/ProductList/ProductsFilter'], function (filterDialog) {
            loadFilterDialog.resolve(filterDialog);
            filterDialog.after_ok.add(function (args) {
                model.queryArguments.pageIndex = 0;
                model.queryArguments.filter(args.filter);
                model.products.removeAll();
                page.on_load({ loadType: chitu.PageLoadType.scroll });
            });
        });
        var page_view = page.view;
        page.view = $.when(page_view, chitu.Utility.loadjs(['UI/PromotionLabel', 'css!content/Home/ProductList']));
        page.viewChanged.add(function () {
            ko.applyBindings(model, page.element);
        });
        page['title'] = function (value) {
            if (page['topbar'])
                page['topbar']['title'](value);
        };
        model.queryArguments.categoryId = page.routeData.values().name;
        model.isFilteByCategory(true);
        shopping.getCategory(model.queryArguments.categoryId).done(function (data) {
            page['title'](data.Name);
        });
        function scrollView_load(sender, args) {
            model.isLoading(true);
            return model.loadProducts(false).done(function (items, filter) {
                model.isLoading(false);
                if (model.queryArguments.filter().indexOf('BrandId') < 0) {
                    filter.Brands.unshift({ Id: '', Name: BRAND_NONE_NAME });
                    model.brands(filter.Brands);
                }
                model.queryArguments.pageIndex = model.queryArguments.pageIndex + 1;
                args.enableScrollLoad = items.length == site.config.pageSize;
            });
        }
        var scroll_view;
        page.viewChanged.add(function () {
            scroll_view = page.findControl('products');
            scroll_view.scrollLoad = scrollView_load;
        });
    };
});
