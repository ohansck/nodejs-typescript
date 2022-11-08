import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';
import authenticated from '@/middleware/authenticated.middleware';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initializeRouter();
    }

    /** Initialize all user endpoints */
    private initializeRouter(): void {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(validate.register),
            this.register
        );

        this.router.post(
            `${this.path}/loginWithEmail`,
            validationMiddleware(validate.loginWithEmail),
            this.loginWithEmail
        );

        this.router.post(
            `${this.path}/loginWithUsername`,
            validationMiddleware(validate.loginWithUsername),
            this.loginWithUsername
        );

        this.router.get(`${this.path}/:id`, authenticated, this.getUser);

        this.router.get(`${this.path}`, authenticated, this.getUsers);
    }

    /** User Controllers */
    private register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { username, name, email, password } = req.body;
            const user = await this.UserService.register(
                username,
                name,
                email,
                password,
                'user'
            );

            res.status(201).json({
                message: 'User registered successfully',
                data: user,
            });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private loginWithEmail = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { email, password } = req.body;

            const accessToken = await this.UserService.loginWithEmail(
                email,
                password
            );
            res.status(200).json({
                message: 'Login successfully',
                data: { accessToken },
            });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private loginWithUsername = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { username, password } = req.body;
            const accessToken = await this.UserService.loginWithUsername(
                username,
                password
            );
            res.status(200).json({
                message: 'Login successfully',
                data: { accessToken },
            });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const id = req.params.id;
            const user = await this.UserService.getUser(id);

            res.status(200).json({
                message: 'User retrieved successfully',
                data: user,
            });
        } catch (error: any) {
            next(new HttpException(404, error.message));
        }
    };

    private getUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const users = await this.UserService.getAllUsers();
            res.status(200).json({
                message: 'Users retrieved successfully',
                data: users,
            });
        } catch (error: any) {
            next(new HttpException(404, error.message));
        }
    };
}

export default UserController;
