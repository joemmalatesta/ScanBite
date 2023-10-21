import type { Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { writeFileSync } from 'fs';

import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';
// Variables for using Clarifai
const PAT = '82ece585b84d4777a7cfb0030053767e';
const USER_ID = 'joemmalatesta';
const APP_ID = 'photofood';
const MODEL_ID = 'food-item-v1-recognition';
const MODEL_VERSION_ID = 'dfebc169854e429086aceb8368662641';

export const actions: Actions = {
	default: async (event) => {
		console.log('hittin that jawn');
		const formData = Object.fromEntries(await event.request.formData());
		// Create array that will store the output of the food.
		let foodArray: any = [];

		if (!(formData.imageFile as File).name || (formData.imageFile as File).name === 'undefined') {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const { imageFile } = formData as { imageFile: File };

		// Add file to folder... not necessary but good if we wanna store in DB
		// writeFileSync(`static/${imageFile.name}`, Buffer.from(await imageFile.arrayBuffer()));

		// Clarifai code to actually get the list of ingredients
		const stub = ClarifaiStub.grpc();

		// This will be used by every Clarifai endpoint call
		const metadata = new grpc.Metadata();
		metadata.set('authorization', 'Key ' + PAT);
		stub.PostModelOutputs(
			{
				user_app_id: {
					user_id: USER_ID,
					app_id: APP_ID
				},
				model_id: MODEL_ID,
				version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
				inputs: [
					{
						data: {
							image: { base64: Buffer.from(await imageFile.arrayBuffer()).toString('base64') }
						}
					}
				]
			},
			metadata,
			(err: any, response: any) => {
				if (err) {
					throw new Error(err);
				}

				if (response.status.code !== 10000) {
					throw new Error('Post model outputs failed, status: ' + response.status.description);
				}

				// Since we have one input, one output will exist here
				const output = response.outputs[0];
				for (const concept of output.data.concepts) {
					foodArray.push([concept.name, concept.value]);
				}

				console.log("food array\n" + foodArray);
			}
		);
		console.log("food array2\n" + foodArray);
		return {
			foodArray
		};
	}
};
