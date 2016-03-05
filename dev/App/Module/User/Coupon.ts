﻿/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />

import coupon = require('Services/Coupon');


export = function(page: chitu.Page) {

    var loadjsDeferred = $.Deferred();
    requirejs(['UI/CouponListItem', 'css!content/User/Coupon'], () => loadjsDeferred.resolve());
    var viewDeferred = page.view;
    page.view = $.when(viewDeferred, loadjsDeferred);
    
    //ko.applyBindings(model, page.node());
    page.viewChanged.add(() => ko.applyBindings(model, page.element));

    var queryArguments = {
        pageIndex: 0,
        status: 'available'
    };

    var model = {
        coupons: ko.observableArray(),
        loading: ko.observable(false),
        firstLoad: undefined,
        status: ko.observable(queryArguments.status),
        loadAvailable: function() {
            queryArguments.status = 'available';
            queryArguments.pageIndex = 0;
            model.status(queryArguments.status);
            model.coupons.removeAll();
            return page.on_load({ loadType: chitu.PageLoadType.scroll });
        },
        loadUsed: function() {
            queryArguments.status = 'used';
            queryArguments.pageIndex = 0;
            model.status(queryArguments.status);
            model.coupons.removeAll();
            return page.on_load({ loadType: chitu.PageLoadType.scroll });
        },
        loadExprired: function() {
            queryArguments.status = 'exprired';
            queryArguments.pageIndex = 0;
            model.status(queryArguments.status);
            model.coupons.removeAll();
            return page.on_load({ loadType: chitu.PageLoadType.scroll });
        }
    };

    model.coupons.removeAll();
    queryArguments.pageIndex = 0;

    page.viewChanged.add(() => {
        page.findControl('coupons').load.add(() => {
            model.loading(true)
            var result = coupon.getMyCoupons(queryArguments).done(function(data) {
                $(data).each(function() {
                    model.coupons.push(this)
                });

                model.loading(false);
                queryArguments.pageIndex = queryArguments.pageIndex + 1;
            });
            return result;
        });
    });
}