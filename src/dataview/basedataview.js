/*
 * Copyright (c) 2014-2016, Wanadev <http://www.wanadev.fr/>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of Wanadev nor the names of its contributors may be used
 *     to endorse or promote products derived from this software without specific
 *     prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Authored by: Valentin Ledrapier
 */

/**
 * PhotonUI - Javascript Web User Interface.
 *
 * @module PhotonUI
 * @submodule DataView
 * @namespace photonui
 */

var Helpers = require("../helpers.js");
var Widget = require("../widget.js");

/**
 * BaseDataView container.
 *
 * @class BaseDataView
 * @constructor
 * @extends photonui.Widget
 */
var BaseDataView = Widget.$extend({

    // Constructor
    __init__: function (params) {
        this._initialSelectionItemIndex = null;
        this.$super(params);

        // Bind js events
        this._bindEvent("click", this.__html.container, "click", this.__onClick.bind(this));
    },

    /**
     * Html outer element of the widget (if any).
     *
     * @property items
     * @type Array
     * @default null
     */
    getItems: function () {
        return this.$data.items;
    },

    setItems: function (items) {
        this.$data.items = items.map(function (item, index) {
            return {
                value: item,
                selected: false,
                index: index,
            };
        });

        this._buildItemsHtml();
    },

    /**
     * Defines if the data items can be selected.
     *
     * @property selectable
     * @type Boolean
     * @default false
     */
    isSelectable: false,

    /**
     * Defines if the data items can be multi-selected.
     *
     * @property multiSelectable
     * @type Boolean
     * @default false
     */
    isMultiSelectable: false,

    /**
     * The currently selected items.
     *
     * @property selectedItems
     * @type Array
     * @default []
     */
    getSelectedItems: function () {
        return this.$data.items.filter(function (item) {
            return item.selected;
        });
    },

    //////////////////////////////////////////
    // Methods                              //
    //////////////////////////////////////////

    // ====== Public methods ======

    // TODO Public methods here

    // ====== Private methods ======

    /**
     * Build the widget HTML.
     *
     * @method _buildHtml
     * @private
     */
    _buildHtml: function () {
        this._buildContainerHtml();
    },

    /**
     * Build the widget container HTML.
     *
     * @method _buildHtml
     * @private
     */
    _buildContainerHtml: function () {
        this.__html.container = document.createElement("ul");
        this.__html.container.className = "photonui-widget photonui-dataview-container";
    },

    /**
     * Build the items list HTML.
     *
     * @method _updateLayout
     * @private
     */
    _buildItemsHtml: function () {
        Helpers.cleanNode(this.__html.container);

        var fragment = document.createDocumentFragment();
        var itemNode;

        this.$data.items.forEach(function (item) {
            var itemNode = this._getItemHtml(item);
            item.node = itemNode;
            fragment.appendChild(itemNode);
        }.bind(this));

        this.__html.container.appendChild(fragment);
    },

    _getItemHtml: function (item) {
      var node = document.createElement("li");
      node.className = "photonui-dataview-item photonui-listview-item";
      node.innerHTML = item.value;
      node.setAttribute("data-photonui-dataview-item-index", item.index);

      return node;
    },

    _selectItem: function (item) {
        item.selected = true;
        item.node.classList.add('selected');
    },

    _unselectItem: function (item) {
        item.selected = false;
        item.node.classList.remove('selected');
    },

    _selectItemsTo: function (item) {
        this._unselectAllItems();

        if (this._initialSelectionItemIndex < item.index) {
            for (var i = this._initialSelectionItemIndex; i <= item.index; i++) {
                this._selectItem(this.items[i]);
            }
        } else {
            for (var j = this._initialSelectionItemIndex; j >= item.index; j--) {
                this._selectItem(this.items[j]);
            }
        }
    },

    _unselectAllItems: function () {
        this.getSelectedItems().forEach(function (item) {
            this._unselectItem(item);
        }.bind(this));
    },

    _getItemFromNode: function (itemNode) {
        var index = itemNode.getAttribute("data-photonui-dataview-item-index");
        return index ? this.$data.items[parseInt(index, 10)] : null;
    },

    _handleClick: function (clickedItem, modifiers) {
        if (this.isSelectable) {
            if (this.isMultiSelectable) {
                if (this.selectedItems.length === 0) {
                  this._selectItem(clickedItem);
                  this._initialSelectionItemIndex = clickedItem.index;
                } else {
                  if (modifiers.shift) {
                    this._selectItemsTo(clickedItem);
                  } else if (modifiers.ctrl) {
                    if (clickedItem.selected) {
                      this._unselectItem(clickedItem);
                    } else {
                      this._selectItem(clickedItem);
                    }
                  } else {
                    this._unselectAllItems();
                    this._selectItem(clickedItem);
                    this._initialSelectionItemIndex = clickedItem.index;
                  }
                }
            } else {
                if (modifiers.ctrl && clickedItem.selected) {
                    this._unselectItem(clickedItem);
                } else {
                    this._unselectAllItems();
                    this._selectItem(clickedItem);
                }
            }
        }
    },

    __onClick: function (e) {
        var clickedItemNode = Helpers.getClosest(e.target, ".photonui-dataview-item");

        if (clickedItemNode) {
          this.__onItemClick(e, this._getItemFromNode(clickedItemNode));
        }
    },

    __onItemClick: function (e, item) {
        this._handleClick(item, {
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
        });
    }
});

module.exports = BaseDataView;
