import type { Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { OpenAI } from 'openai';
import { OPENAI_KEY } from '$env/static/private';

const openAI = new OpenAI({
	apiKey: OPENAI_KEY
});

import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';
// Variables for using Clarifai
const PAT = '82ece585b84d4777a7cfb0030053767e';
const USER_ID = 'joemmalatesta';
const APP_ID = 'photofood';
const MODEL_ID = 'food-item-v1-recognition';
const MODEL_VERSION_ID = 'dfebc169854e429086aceb8368662641';

let ingredients: any = [];

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
		let foodArray: any = await postModelOutputs(await imageFile.arrayBuffer());

		// Remove items in food array that are below .7 confidence
		let filteredArray = foodArray.filter(([_, confidence]: [any, any]) => confidence >= 0.7);
		//Set the first element of each [ingredient, confidence] to ingredients for GPT use.
		filteredArray.forEach((element: any) => {
			ingredients.push(element[0]);
		});

		let prompt = `You're Nutrition GPT, an expert on health, food, diet, and all things nutrition. Your job today is to give four simple ratings to a meal that one of your friends said they ate. The meal included these ingredients. ${ingredients}
	  You can ignore any ingredient that sounds like a full meal like "tacos" or "burritos".
	  
	  The four ratings you are to give are Overall nutritional value, protein content, fiber content, and vitamin content. Ratings are on a 100 point scale with 0 being the least nutritious and 100 being the most. 
	  
	  Your output should only have four whole numbers and nothing else. it should be in the order of overall, protein, fiber, and then vitamin.
	  
	  An example output if cake was a main ingredient would be
	  30, 20, 40, 30

	  but if broccoli and chicken were main ingredients you may say
	  75, 80, 70, 80
	  
	  again, your answer should have no explanation, no reasoning, and nothing other than four numbers.`;
		const res = await openAI.chat.completions.create({
			model: 'gpt-4',
			messages: [{ role: 'user', content: prompt }]
		});
		let ratings = [
			['Overall', res.choices[0].message.content?.split(',')[0]],
			['Protein', res.choices[0].message.content?.split(',')[1]],
			['Fiber', res.choices[0].message.content?.split(',')[2]],
			['Vitamins', res.choices[0].message.content?.split(',')[3]]
		];

		// After we get ingredients, go into ChatGPT and give it a generalize health rating
		return {
			ratings,
			foodArray: ingredients,
			image: imageFile.name
		};
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
					app_id: APP_ID
				},
				model_id: MODEL_ID,
				version_id: MODEL_VERSION_ID,
				inputs: [
					{
						data: {
							image: { base64: Buffer.from(imageFile).toString('base64') }
						}
					}
				]
			},
			metadata,
			(err: any, response: any) => {
				if (err) reject(err);

				const foodArray = [];

				if (response.status.code !== 10000)
					reject(new Error(`Post model outputs failed, status:${response.status.description}`));

				const output = response.outputs[0];
				for (const concept of output.data.concepts) foodArray.push([concept.name, concept.value]);

				resolve(foodArray);
			}
		);
	});
}
