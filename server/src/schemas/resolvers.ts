import User from '../models/index.js';
import { signToken, } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';

interface Context {
  user?: { _id: string; username: string; email: string }; // Define the user type based on your JWT payload
}


interface LoginUserArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  }
}

interface AddBookArgs {
  input: {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    link: string;
  }
}

interface RemoveBookArgs {
  bookId: string;
}

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in.');
      }
      return await User.findById(user._id).populate('sabedBooks');
    },
  },

  Mutation: {
    login: async (_: unknown, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user.username, user.email, user.id);
      return { token, user };
    },

    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user.id);
      return { token, user };
    },

    saveBook: async (_parent: any, { input }: AddBookArgs, context: any) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user.data._id },
          {
            $addToSet: { savedBooks: { ...input } }
          },
          { new: true },
        );
        return updatedUser;
      }
      throw new AuthenticationError('Error adding book.');
    },

    removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: any) => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user.data._id },
          {
            $pull: { savedBooks: { bookId } }
          },
          { new: true },
        );
      }
      throw new AuthenticationError('Error removing book');
    },
  },
};

export default resolvers;