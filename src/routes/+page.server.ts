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
		const formData = Object.fromEntries(await event.request.formData());

		if (!(formData.imageFile as File).name || (formData.imageFile as File).name === 'undefined') {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const { imageFile } = formData as { imageFile: File };

		// Add file to folder... not necessary but good if we wanna store in DB
		writeFileSync(`static/${imageFile.name}`, Buffer.from(await imageFile.arrayBuffer()));

		// Get the output from Clarifai about what foods are pictured.
		let foodArray: any = await postModelOutputs(await imageFile.arrayBuffer())

		// Remove items in food array that are below .7 confidence
		let filteredArray = foodArray.filter(([_, confidence]: [any, any]) => confidence >= 0.7);

		return {
			foodArray: filteredArray,
			image: imageFile.name
		}
	}
};




function postModelOutputs(imageFile: any) {
	return new Promise((resolve, reject) => {
	  const stub = ClarifaiStub.grpc();
	  const metadata = new grpc.Metadata();
	  metadata.set('authorization', `Key ${PAT}`);
  
	  stub.PostModelOutputs(
		{
		  user_app_id: {
			user_id: USER_ID,
			app_id: APP_ID,
		  },
		  model_id: MODEL_ID,
		  version_id: MODEL_VERSION_ID,
		  inputs: [
			{
			  data: {
				image: { base64: Buffer.from(imageFile).toString('base64') },
			  },
			},
		  ],
		},
		metadata,
		(err: any, response: any) => {
		  if (err) reject(err);
		  
		  const foodArray = [];
		  
		  if (response.status.code !== 10000) 
			  reject(new Error(`Post model outputs failed, status:${response.status.description}`));
		  
		  const output = response.outputs[0];
		  for (const concept of output.data.concepts)
			  foodArray.push([concept.name, concept.value]);
  
		  resolve(foodArray);
		});
	});
  }