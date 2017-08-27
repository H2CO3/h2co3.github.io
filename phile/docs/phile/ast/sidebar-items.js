initSidebarItems({"enum":[["ExpKind","Type and value of an `Exp` expression node."],["Item","A top-level source item."],["TyKind","Type and value of a `Ty` type node."]],"struct":[["BinaryOp","Any binary operator."],["ClassDecl","Definition of a `class` type."],["CondExp","A conditional expression or 'Elvis operator', `?:`."],["EnumDecl","Definition of an `enum` type."],["Field","A field specification within a struct or class type definition."],["FuncArg","Declaration of a single function argument."],["FuncCall","A function call operation."],["Function","A function definition."],["FunctionTy","A function type."],["If","An if statement or expression."],["Impl","Implementation of the methods of a user-defined type."],["Match","A match statement or expression."],["MemberAccess","Dot syntax for accessing fields and methods."],["Node","Generic AST node (helper for Exp, Ty, etc.)"],["QualAccess","Namespace-style member access, for e.g. enums."],["RelDecl","Declaration of an explicit relation between two class types. A `RelDecl` node semantically means that the LHS of the relation is the class in which the `RelDecl` is contained, while the RHS is the type of the corresponding field."],["StructDecl","Definition of a `struct` type."],["StructLiteral","A struct literal."],["Subscript","An indexing or subscripting operator."],["VarDecl","A variable declaration statement for locals."],["Variant","Definition of one enum variant."]],"type":[["Exp","AST node representing an expression."],["Prog","Root of the AST. A list of top-level items, such as type definitions, function definitions, or `impl`s."],["Ty","AST node representing a type annotation."]]});