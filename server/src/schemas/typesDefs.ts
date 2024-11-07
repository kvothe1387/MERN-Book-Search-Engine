const typeDefs = `
  type User{
    _id: String
    username: String
    email: String
    password: String
    bookCount: Int
    savedBooks: [Book]
  }
    
  type Book{
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  input UserInput{
    username: String
    email: String
    password: String
  }
    
  type Auth {
    token: String
    user: User
  }

  type Query {
    me: User
  }
  
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(input: UserInput!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: String!): User
  }
  
  input BookInput {
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }
`;

export default typeDefs;