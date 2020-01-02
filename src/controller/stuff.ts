import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal, Like } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';
import { Stuff, stuffSchema } from '../entity/stuff';

@responsesAll({ 200: { description: 'success' }, 400: { description: 'bad request' }, 401: { description: 'unauthorized, missing/wrong jwt token' } })
@tagsAll(['Stuff'])
export default class ProjectController {

    @request('get', '/stuffs')
    @summary('Find all users')
    public static async getStuffs(ctx: BaseContext) {

        // get a stuff repository to perform operations with stuff
        const entityRepository: Repository<Stuff> = getManager().getRepository(Stuff);

        // load all users
        const items: Stuff[] = await entityRepository.find();

        // return OK status code and loaded users array
        ctx.status = 200;
        ctx.body = items;
        ctx.append('Content-Range', `${items.length}`);
    }

    @request('get', '/stuffs/{id}')
    @summary('Find stuff by id')
    @path({
        id: { type: 'number', required: true, description: 'id of stuff' }
    })
    public static async getStuff(ctx: BaseContext) {

        // get a stuff repository to perform operations with stuff
        const userRepository: Repository<Stuff> = getManager().getRepository(Stuff);

        // load stuff by id
        const stuff: Stuff = await userRepository.findOne(+ctx.params.id || 0);

        if (stuff) {
            // return OK status code and loaded stuff object
            ctx.status = 200;
            ctx.body = stuff;
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The stuff you are trying to retrieve doesn\'t exist in the db';
        }

    }

    @request('post', '/stuffs')
    @summary('Create a stuff')
    @body(stuffSchema)
    public static async createStuff(ctx: BaseContext) {

        // get a stuff repository to perform operations with stuff
        const userRepository: Repository<Stuff> = getManager().getRepository(Stuff);

        // build up entity stuff to be saved
        const userToBeSaved: Stuff = new Stuff();
        userToBeSaved.name = ctx.request.body.name;
        userToBeSaved.desc = ctx.request.body.desc;

        // validate stuff entity
        const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if (await userRepository.findOne({ name: userToBeSaved.name })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = 400;
            ctx.body = 'The specified e-mail address already exists';
        } else {
            // save the stuff contained in the POST body
            const stuff = await userRepository.save(userToBeSaved);
            // return CREATED status code and updated stuff
            ctx.status = 201;
            ctx.body = stuff;
        }
    }

    @request('put', '/stuffs/{id}')
    @summary('Update a stuff')
    @path({
        id: { type: 'number', required: true, description: 'id of stuff' }
    })
    @body(stuffSchema)
    public static async updateStuff(ctx: BaseContext) {

        // get a stuff repository to perform operations with stuff
        const userRepository: Repository<Stuff> = getManager().getRepository(Stuff);

        // update the stuff by specified id
        // build up entity stuff to be updated
        const userToBeUpdated: Stuff = new Stuff();
        userToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        userToBeUpdated.name = ctx.request.body.name;
        userToBeUpdated.desc = ctx.request.body.desc;

        // validate stuff entity
        const errors: ValidationError[] = await validate(userToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if (!await userRepository.findOne(userToBeUpdated.id)) {
            // check if a stuff with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The stuff you are trying to update doesn\'t exist in the db';
        } else if (await userRepository.findOne({ id: Not(Equal(userToBeUpdated.id)), name: userToBeUpdated.name })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = 400;
            ctx.body = 'The specified e-mail address already exists';
        } else {
            // save the stuff contained in the PUT body
            const stuff = await userRepository.save(userToBeUpdated);
            // return CREATED status code and updated stuff
            ctx.status = 201;
            ctx.body = stuff;
        }

    }

    @request('delete', '/stuffs/{id}')
    @summary('Delete stuff by id')
    @path({
        id: { type: 'number', required: true, description: 'id of stuff' }
    })
    public static async deleteStuff(ctx: BaseContext) {

        // get a stuff repository to perform operations with stuff
        const userRepository = getManager().getRepository(Stuff);

        // find the stuff by specified id
        const userToRemove: Stuff = await userRepository.findOne(+ctx.params.id || 0);
        if (!userToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The stuff you are trying to delete doesn\'t exist in the db';
        } else if (+ctx.state.stuff.id !== userToRemove.id) {
            // check stuff's token id and stuff id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.body = 'A stuff can only be deleted by himself';
        } else {
            // the stuff is there so can be removed
            await userRepository.remove(userToRemove);
            // return a NO CONTENT status code
            ctx.status = 204;
        }

    }

}
