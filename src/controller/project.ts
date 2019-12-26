import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal, Like } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';
import { Project, projectSchema } from '../entity/project';

@responsesAll({ 200: { description: 'success' }, 400: { description: 'bad request' }, 401: { description: 'unauthorized, missing/wrong jwt token' } })
@tagsAll(['Project'])
export default class ProjectController {

    @request('get', '/projects')
    @summary('Find all users')
    public static async getProjects(ctx: BaseContext) {

        // get a user repository to perform operations with user
        const entityRepository: Repository<Project> = getManager().getRepository(Project);

        // load all users
        const items: Project[] = await entityRepository.find();

        // return OK status code and loaded users array
        ctx.status = 200;
        ctx.body = items;
        ctx.append('Content-Range', `${items.length}`);
    }

    @request('get', '/projects/{id}')
    @summary('Find project by id')
    @path({
        id: { type: 'number', required: true, description: 'id of user' }
    })
    public static async getProject(ctx: BaseContext) {

        // get a user repository to perform operations with user
        const userRepository: Repository<Project> = getManager().getRepository(Project);

        // load user by id
        const user: Project = await userRepository.findOne(+ctx.params.id || 0);

        if (user) {
            // return OK status code and loaded user object
            ctx.status = 200;
            ctx.body = user;
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The user you are trying to retrieve doesn\'t exist in the db';
        }

    }

    @request('post', '/projects')
    @summary('Create a user')
    @body(projectSchema)
    public static async createUser(ctx: BaseContext) {

        // get a user repository to perform operations with user
        const userRepository: Repository<Project> = getManager().getRepository(Project);

        // build up entity user to be saved
        const userToBeSaved: Project = new Project();
        userToBeSaved.name = ctx.request.body.name;
        userToBeSaved.desc = ctx.request.body.desc;

        // validate user entity
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
            // save the user contained in the POST body
            const user = await userRepository.save(userToBeSaved);
            // return CREATED status code and updated user
            ctx.status = 201;
            ctx.body = user;
        }
    }

    @request('put', '/projects/{id}')
    @summary('Update a user')
    @path({
        id: { type: 'number', required: true, description: 'id of user' }
    })
    @body(projectSchema)
    public static async updateUser(ctx: BaseContext) {

        // get a user repository to perform operations with user
        const userRepository: Repository<Project> = getManager().getRepository(Project);

        // update the user by specified id
        // build up entity user to be updated
        const userToBeUpdated: Project = new Project();
        userToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        userToBeUpdated.name = ctx.request.body.name;
        userToBeUpdated.desc = ctx.request.body.desc;

        // validate user entity
        const errors: ValidationError[] = await validate(userToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if (!await userRepository.findOne(userToBeUpdated.id)) {
            // check if a user with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The user you are trying to update doesn\'t exist in the db';
        } else if (await userRepository.findOne({ id: Not(Equal(userToBeUpdated.id)), name: userToBeUpdated.name })) {
            // return BAD REQUEST status code and email already exists error
            ctx.status = 400;
            ctx.body = 'The specified e-mail address already exists';
        } else {
            // save the user contained in the PUT body
            const user = await userRepository.save(userToBeUpdated);
            // return CREATED status code and updated user
            ctx.status = 201;
            ctx.body = user;
        }

    }

    @request('delete', '/projects/{id}')
    @summary('Delete user by id')
    @path({
        id: { type: 'number', required: true, description: 'id of user' }
    })
    public static async deleteUser(ctx: BaseContext) {

        // get a user repository to perform operations with user
        const userRepository = getManager().getRepository(Project);

        // find the user by specified id
        const userToRemove: Project = await userRepository.findOne(+ctx.params.id || 0);
        if (!userToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The user you are trying to delete doesn\'t exist in the db';
        } else if (+ctx.state.user.id !== userToRemove.id) {
            // check user's token id and user id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.body = 'A user can only be deleted by himself';
        } else {
            // the user is there so can be removed
            await userRepository.remove(userToRemove);
            // return a NO CONTENT status code
            ctx.status = 204;
        }

    }

}
