import User from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

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
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user.data._id });
      }
      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
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