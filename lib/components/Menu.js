/** @jsx React.DOM */

var React = require('react');
var ReactDOM = require('react-dom');

var cloneWithProps = React.cloneElement;
var MenuTrigger = require('./MenuTrigger');
var MenuOptions = require('./MenuOptions');
var MenuOption = require('./MenuOption');
var uuid = require('../helpers/uuid');
var injectCSS = require('../helpers/injectCSS');
var buildClassName = require('../mixins/buildClassName');

var Menu = module.exports = React.createClass({

    displayName: 'Menu',

    statics: {
	injectCSS: injectCSS
    },

    mixins: [buildClassName],

    childContextTypes: {
	id: React.PropTypes.string,
	active: React.PropTypes.bool
    },

    getChildContext: function () {
	return {
	    id: this.state.id,
	    active: this.state.active
	};
    },

    getInitialState: function(){
	return {
	    id: uuid(),
	    active: false,
	    selectedIndex: 0,
	    horizontalPlacement: 'right', // only 'right' || 'left'
	    verticalPlacement: 'bottom' // only 'top' || 'bottom'
	};
    },

    closeMenu: function() {
	this.setState({active: false}, this.focusTrigger);
    },

    focusTrigger: function() {
	ReactDOM.findDOMNode(this.refs.trigger).focus();
    },

    handleBlur: function(e) {
	// give next element a tick to take focus
	setTimeout(function() {
	    if (!ReactDOM.findDOMNode(this).contains(document.activeElement) && this.state.active){
		this.closeMenu();
	    }
	}.bind(this), 1);
    },

    handleTriggerToggle: function() {
	this.setState({active: !this.state.active}, this.afterTriggerToggle);
    },

    afterTriggerToggle: function() {
	if (this.state.active) {
	    this.refs.options.focusOption(0);
	    this.updatePositioning();
	}
    },

    updatePositioning: function() {
//this.refs.trigger.getDOMNode()
	var triggerRect = ReactDOM.findDOMNode(this).getBoundingClientRect();
	var optionsRect = ReactDOM.findDOMNode(this).getBoundingClientRect();
	var positionState = {};
	// horizontal = left if it wont fit on left side
	if (triggerRect.left + optionsRect.width > window.innerWidth) {
	    positionState.horizontalPlacement = 'left';
	} else {
	    positionState.horizontalPlacement = 'right';
	}
	if (triggerRect.top + optionsRect.height > window.innerHeight) {
	    positionState.verticalPlacement = 'top';
	} else {
	    positionState.verticalPlacement = 'bottom';
	}
	this.setState(positionState);
    },

    handleKeys: function(e) {
	if (e.key === 'Escape') {
	    this.closeMenu();
	}
    },

    verifyTwoChildren: function() {
	var ok = (React.Children.count(this.props.children) === 2);
	if (!ok)
	    throw 'react-menu can only take two children, a MenuTrigger, and a MenuOptions';
	return ok;
    },

    renderTrigger: function() {
	var trigger;
	if(this.verifyTwoChildren()) {
	    React.Children.forEach(this.props.children, function(child){
		if (child.type.displayName === 'MenuTrigger') {
		    trigger = cloneWithProps(child, {
			ref: 'trigger',
			onToggleActive: this.handleTriggerToggle
		    });
		}
	    }.bind(this));
	}
	return trigger;
    },

    renderMenuOptions: function() {
	var options;
	if(this.verifyTwoChildren()) {
	    React.Children.forEach(this.props.children, function(child){
		if (child.type.displayName === 'MenuOptions') {
		    options = cloneWithProps(child, {
			ref: 'options',
			horizontalPlacement: this.state.horizontalPlacement,
			verticalPlacement: this.state.verticalPlacement,
			onSelectionMade: this.closeMenu
		    });
		}
	    }.bind(this));
	}
	return options;
    },

    render: function() {
	return (
	    React.DOM.div({
		className: this.buildClassName('Menu'), 
		onKeyDown: this.handleKeys, 
		onBlur: this.handleBlur
	    }, 
			  this.renderTrigger(), 
			  this.renderMenuOptions()
			 )
	)
    }

});
