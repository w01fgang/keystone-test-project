import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Form, FormField, FormInput, FileUpload, Row } from 'elemental';

import api from '../../../client/lib/api';

const Test = React.createClass({
	getInitialState () {
		return {
			image_one: null,
			image_two: null,
		};
	},
	componentDidMount () {
		this.props.ready();
	},
	handleFile (img, data) {
		this.setState({
			[`image_${img}`]: {
				file: data.file,
				dataURI: data.dataURI,
			},
		});
	},
	runTest () {
		this.props.run();
		var formData = new window.FormData();
		var images = 0;
		formData.append('name', 'Test Updated ' + Date.now());
		if (this.state.image_one) {
			images++;
			formData.append('images', this.state.image_one.file);
		}
		if (this.state.image_two) {
			images++;
			formData.append('images', this.state.image_two.file);
		}
		if (!images) {
			formData.append('images', '');
		}

		api.post('/keystone/api/galleries/' + this.props.stepContext.gallery.id, {
			body: formData,
			responseType: 'json',
		}, (err, res, body) => {
			this.props.result('Received response:', body);
			this.props.assert('status code is 200').truthy(() => res.statusCode === 200);
			if (images >= 1) {
				this.props.assert('image 1 has been uploaded').truthy(() => body.fields.images[0].url.substr(0,25) === 'http://res.cloudinary.com');
			}
			if (images >= 2) {
				this.props.assert('image 2 has been uploaded').truthy(() => body.fields.images[1].url.substr(0,25) === 'http://res.cloudinary.com');
			}
			this.props.assert('images array contains the right number of items').truthy(() => body.fields.images.length === images);
			this.props.complete({ gallery: body });
		});
	},
	render () {
		return (
			<div>
				<h2 style={{ marginBottom: 0 }}>Upload Multiple Images</h2>
				<Form type="horizontal">
					<FormField label="Image" style={localStyles.field}>
						<FileUpload buttonLabelInitial="Upload Image 1" buttonLabelChange="Change Image 1" name="one" onChange={(e, data) => this.handleFile('one', data)} />
					</FormField>
					<FormField label="Image" style={localStyles.field}>
						<FileUpload buttonLabelInitial="Upload Image 2" buttonLabelChange="Change Image 2" name="two" onChange={(e, data) => this.handleFile('two', data)} />
					</FormField>
				</Form>
				<hr />
				<Row>
					<Col sm="1/2">
						<Button ref="run" type="primary" onClick={this.runTest}>Test Images Upload</Button>
					</Col>
					<Col sm="1/2" style={{ align: 'right' }}>
						<Button ref="next" type="default" onClick={this.props.next} style={{ float: "right" }}>Next</Button>
					</Col>
				</Row>
			</div>
		);
	}
});

const localStyles = {
	field: {
		marginTop: 20,
	},
};

module.exports = Test;
