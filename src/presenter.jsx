Shift.PresenterFor = ShiftPresenterFor = React.createClass({
	render: function () { throw new Error("Should not be rendered") }
});
Shift.IfNonEmptyValueFor = IfNonEmptyValueFor = React.createClass({
	render: function () { throw new Error("Should not be rendered") }
});
Shift.IfEmptyValueFor = ShiftIfEmptyValueFor = React.createClass({
	render: function () { throw new Error("Should not be rendered") }
});

Shift.Presenter = ShiftPresenter = React.createClass({
	mixins: [Shift.Mixins.translate],
	defaultTemplate: <div key='div'>
		<ShiftFieldsFor key='fields'>
			<div>
				<ShiftTitleFor key='title' />
				<span key='separator'>: </span>
				<ShiftPresenterFor key='presenter' />
			</div>
		</ShiftFieldsFor>
		<ShiftCategoryFor key='category'>
			<fieldset>
				<ShiftCategoryNameFor key='category-name' tagName='legend' />
				<ShiftFieldsFor key='fields'>
					<div>
						<ShiftTitleFor key='title' />
						<span key='separator'>: </span>
						<ShiftPresenterFor key='presenter' />
					</div>
				</ShiftFieldsFor>
			</fieldset>
		</ShiftCategoryFor>
	</div>,
	propTypes: {
		fields: React.PropTypes.arrayOf(React.PropTypes.string)
	},
	getDefaultProps: function () {
		return {
			locale: 'en_US',
			context: null,
			TitleComponent: ShiftTitle
		};
	},
	translateCategoryName: function (category) {
		if (this.props.categoryTranslations) {
			if (this.props.categoryTranslations[this.props.locale]) {
				category = this.props.categoryTranslations[this.props.locale][category];
			}
		}

		if (this.props.TitleComponent != null) {
			var TitleComponent = this.props.TitleComponent;
			return <TitleComponent text={category} locale={this.props.locale} />;
		}

		return category;
	},
	getTemplate: function () {
		var template = this.props.template || this.props.children || this.defaultTemplate;
		return template;
	},
	getFields: function () {
		var fields = this.props.fields || Object.keys(this.props.schema);

		var result = [];

		for (var i in fields) {
			var field = fields[i];

			if (this.props.schema[field].presenter) {
				result.push(field);
			}
		}

		return result;
	},
	getCategories: function () {
		var categories = this.props.categories || {};

		var result = {};

		for (var categoryName in categories) {
			var fieldNames = categories[categoryName];

			var fields = [];

			for (var i in fieldNames) {
				var field = fieldNames[i];

				if (this.props.schema[field].presenter) {
					fields.push(field);
				}
			}

			if (fields.length > 0) {
				result[categoryName] = fields;
			}
		}

		return result;
	},
	render: function () {
		var that = this;
		var template = this.getTemplate();

		var templateMap = this.getTemplateMap();

		var result = utils.templateHelper(template, this.getFields(), this.getCategories(), function (category) {
			return that.translateCategoryName(category);
		}, templateMap, function (fieldName) {
			if (!fieldName) {
				return that.props.value;
			}
			return that.props.value[fieldName];
		}, this.props.context, this.props.schema);

		return result;
	},
	getTemplateMap: function () {
		var that = this;
		var result = [];

		result.push(Shift.PresenterFor);
		result.push(function (fieldName, reactNode) {
			var field = that.props.schema[fieldName];
			var origProps = utils.extend({}, reactNode.props);
			delete origProps.field;
			return React.createElement(utils.unwrapPresenter(field.presenter), (utils.extend({}, origProps, field.presenterProps, {
				key: 'presenter-' + fieldName,
				value: utils.getIn(that.props.value, fieldName),
				className: reactNode.props.className,
				locale: that.props.locale,
				context: that.props.context,
				field: fieldName
			})));
		});

		result.push(Shift.TitleFor);
		result.push(function (fieldName, reactNode) {
			var field = that.props.schema[fieldName];
			var tagName = reactNode.props.tagName;
			var className = reactNode.props.className;
			var TitleComponent = that.props.TitleComponent;
			return <TitleComponent
				key={'title-' + fieldName}
				tagName={tagName}
				locale={that.props.locale}
				text={that.translate(field.label)}
				className={className}
			/>;
		});

		result.push(Shift.IfNonEmptyValueFor);
		result.push(function (fieldName, reactNode) {
			var fieldValue = that.props.value[fieldName];
			if (utils.isEmptyValue(fieldValue)) {
				return null;
			}

			return reactNode.props.children;
		});

		result.push(Shift.IfEmptyValueFor);
		result.push(function (fieldName, reactNode) {
			var fieldValue = that.props.value[fieldName];
			if (utils.isEmptyValue(fieldValue)) {
				return reactNode.props.children;
			}

			return null;
		});

		return result;
	},
});
