import {apiPaths} from '@hue-crm/enums';
import {User} from '@hue-crm/utilities';
import {HttpStatus} from '@nestjs/common';
import * as request from 'supertest';
import {ApiParamsEnum} from '../../../libs/enums/src/lib/api-params.enum';

const app = process.env.URL;
const baseAuthPath = apiPaths.api + '/' + apiPaths.auth + '/';
const testUser = 'testUser';
const testPassword = '1234567890';
const testEmail = 'testUser@test.com';

describe('Server Status', () => {
	it('Should display message that server is running', () => {
		return request(app)
			.get(apiPaths.api)
			.expect(200)
			.expect('Server is running');
	});
});

describe('Registration, Login and Delete user flow', () => {
	
	const deletePath = baseAuthPath + apiPaths.delete
		+ '?' + ApiParamsEnum.username + '=' + testUser;
	const registerPath = baseAuthPath + apiPaths.register + '?'
		+ ApiParamsEnum.username + '=' + testUser + '&'
		+ ApiParamsEnum.password + '=' + testPassword + '&'
		+ ApiParamsEnum.email + '=' + testEmail;
	const loginPath = baseAuthPath + apiPaths.login + '?'
		+ ApiParamsEnum.username + '=' + testUser + '&'
		+ ApiParamsEnum.password + '=' + testPassword;
	
	it('Should delete last test user', () => {
		return request(app)
			.post(deletePath)
			.expect('User has been deleted');
	});
	
	it('Should register a test user and check for not returning password', () => {
		return request(app)
			.post(registerPath)
			.set('Accept', 'application/json')
			.expect(HttpStatus.CREATED)
			.expect(User)
			.expect(({body}) => {
				expect(body.token).toBeDefined();
				expect(body.user.username).toEqual(testUser);
				expect(body.user.password).toBeUndefined();
			});
	});
	
	it('Should check for duplicate registration not being allowed', () => {
		return request(app)
			.post(registerPath)
			.set('Accept', 'application/json')
			.expect(HttpStatus.BAD_REQUEST)
			.expect(({body}) => {
				expect(body.message).toEqual('User already exists');
			});
	});
	
	it('Should login the user, receive the token and check for not returning password', () => {
		return request(app)
			.post(loginPath)
			.set('Accept', 'application/json')
			.expect(HttpStatus.CREATED)
			.expect(User)
			.expect(({body}) => {
				expect(body.token).toBeDefined();
				expect(body.user.username).toEqual(testUser);
				expect(body.user.password).toBeUndefined();
			});
	});
});

