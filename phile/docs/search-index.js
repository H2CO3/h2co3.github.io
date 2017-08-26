var searchIndex = {};
searchIndex["phile"] = {"doc":"","items":[[0,"util","phile","",null,null],[3,"PackageInfo","phile::util","",null,null],[12,"name","","",0,null],[12,"version","","",0,null],[12,"authors","","",0,null],[12,"description","","",0,null],[12,"home_page","","",0,null],[3,"Color","","",null,null],[12,"reset","","",1,null],[12,"info","","",1,null],[12,"highlight","","",1,null],[12,"success","","",1,null],[12,"error","","",1,null],[3,"RcCell","","",null,null],[3,"WkCell","","",null,null],[5,"grapheme_count","","",null,{"inputs":[{"name":"str"}],"output":{"name":"usize"}}],[5,"grapheme_count_by","","",null,{"inputs":[{"name":"str"},{"name":"p"}],"output":{"name":"usize"}}],[5,"unescape_string_literal","","",null,{"inputs":[{"name":"str"}],"output":{"name":"result"}}],[7,"PACKAGE_INFO","","",null,null],[7,"COLOR","","",null,null],[11,"fmt","","",0,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",0,{"inputs":[{"name":"self"}],"output":{"name":"packageinfo"}}],[11,"fmt","","",1,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",1,{"inputs":[{"name":"self"}],"output":{"name":"color"}}],[11,"fmt","","",2,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"default","","",2,{"inputs":[],"output":{"name":"rccell"}}],[11,"fmt","","",3,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"default","","",3,{"inputs":[],"output":{"name":"wkcell"}}],[11,"new","","",2,{"inputs":[{"name":"t"}],"output":{"name":"rccell"}}],[11,"borrow","","",2,{"inputs":[{"name":"self"}],"output":{"name":"result"}}],[11,"borrow_mut","","",2,{"inputs":[{"name":"self"}],"output":{"name":"result"}}],[11,"as_weak","","",2,{"inputs":[{"name":"self"}],"output":{"name":"wkcell"}}],[11,"clone","","",2,{"inputs":[{"name":"self"}],"output":{"name":"rccell"}}],[11,"eq","","",2,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"bool"}}],[11,"hash","","",2,{"inputs":[{"name":"self"},{"name":"h"}],"output":null}],[11,"fmt","","",2,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"new","","",3,{"inputs":[],"output":{"name":"wkcell"}}],[11,"as_rc","","",3,{"inputs":[{"name":"self"}],"output":{"name":"result"}}],[11,"clone","","",3,{"inputs":[{"name":"self"}],"output":{"name":"wkcell"}}],[11,"fmt","","",3,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[0,"error","phile","",null,null],[4,"Error","phile::error","",null,null],[13,"IO","","",4,null],[13,"Borrow","","",4,null],[13,"BorrowMut","","",4,null],[13,"Strongify","","",4,null],[13,"Unreachable","","",4,null],[12,"message","phile::error::Error","",4,null],[12,"file","","",4,null],[12,"line","","",4,null],[13,"Syntax","phile::error","",4,null],[12,"message","phile::error::Error","",4,null],[12,"range","","",4,null],[13,"Semantic","phile::error","",4,null],[12,"message","phile::error::Error","",4,null],[12,"range","","",4,null],[6,"Result","phile::error","",null,null],[11,"fmt","","",4,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"pretty_print","","",4,null],[11,"description","","",4,{"inputs":[{"name":"self"}],"output":{"name":"str"}}],[11,"cause","","",4,{"inputs":[{"name":"self"}],"output":{"name":"option"}}],[11,"fmt","","",4,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"from","","",4,{"inputs":[{"name":"error"}],"output":{"name":"error"}}],[11,"from","","",4,{"inputs":[{"name":"borrowerror"}],"output":{"name":"self"}}],[11,"from","","",4,{"inputs":[{"name":"borrowmuterror"}],"output":{"name":"self"}}],[0,"lexer","phile","",null,null],[3,"Location","phile::lexer","Represents the location of a single extended grapheme cluster in the sources fed to the lexer.",null,null],[12,"src_idx","","0-based index of the source that this location points into.",5,null],[12,"line","","1-based line index within the aforementioned source.",5,null],[12,"column","","1-based character index within the line.",5,null],[3,"Range","","A half-open range representing a source span.",null,null],[12,"begin","","Location at the beginning of the source range.",6,null],[12,"end","","Location one past the end of the source range.",6,null],[3,"Token","","Represents a lexeme and its associated type and location information as an abstract token.",null,null],[12,"kind","","The kind associated with the recognized lexeme.",7,null],[12,"value","","A pointer into the source where the underlying lexeme was found.",7,null],[12,"range","","Human-readable range information for the underlying lexeme.",7,null],[4,"TokenKind","","Describes the type of a single token or lexeme.",null,null],[13,"Whitespace","","Horizontal and vertical (e.g. newline) whitespace. Unicode-aware.",8,null],[13,"Comment","","Currently, a line comment, beginning with '#' and ending with vertical whitespace or end-of-source.",8,null],[13,"Word","","An identifier or a keyword.",8,null],[13,"Punctuation","","Operators and other punctuation characters, e.g. semicolons.",8,null],[13,"StringLiteral","","String literal.",8,null],[13,"NumericLiteral","","Integer or floating-point literal.",8,null],[5,"lex","","Given an array of source strings, returns an array of tokens extracted from those strings, or an error if there is a syntactic (more precisely, lexical) error in any of the source strings.",null,null],[8,"Ranged","","This trait is to be implemented by entities that correspond to some range in the source. This is used for generating location information in user-visible error messages.",null,null],[10,"range","","Returns the range `self` was generated from.",9,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"fmt","","",5,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",5,{"inputs":[{"name":"self"}],"output":{"name":"location"}}],[11,"default","","",5,{"inputs":[],"output":{"name":"location"}}],[11,"eq","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"ne","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"option"}}],[11,"lt","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"le","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"gt","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"ge","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"bool"}}],[11,"cmp","","",5,{"inputs":[{"name":"self"},{"name":"location"}],"output":{"name":"ordering"}}],[11,"hash","","",5,null],[11,"fmt","","",6,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",6,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"default","","",6,{"inputs":[],"output":{"name":"range"}}],[11,"eq","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"ne","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"option"}}],[11,"lt","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"le","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"gt","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"ge","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"bool"}}],[11,"cmp","","",6,{"inputs":[{"name":"self"},{"name":"range"}],"output":{"name":"ordering"}}],[11,"hash","","",6,null],[11,"fmt","","",8,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",8,{"inputs":[{"name":"self"}],"output":{"name":"tokenkind"}}],[11,"eq","","",8,{"inputs":[{"name":"self"},{"name":"tokenkind"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",8,{"inputs":[{"name":"self"},{"name":"tokenkind"}],"output":{"name":"option"}}],[11,"cmp","","",8,{"inputs":[{"name":"self"},{"name":"tokenkind"}],"output":{"name":"ordering"}}],[11,"hash","","",8,null],[11,"fmt","","",7,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",7,{"inputs":[{"name":"self"}],"output":{"name":"token"}}],[11,"eq","","",7,{"inputs":[{"name":"self"},{"name":"token"}],"output":{"name":"bool"}}],[11,"ne","","",7,{"inputs":[{"name":"self"},{"name":"token"}],"output":{"name":"bool"}}],[11,"hash","","",7,null],[11,"fmt","","",5,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",6,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"range","","",6,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",7,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[0,"ast","phile","",null,null],[3,"Node","phile::ast","",null,null],[12,"kind","","",10,null],[12,"range","","",10,null],[3,"StructDecl","","",null,null],[12,"range","","",11,null],[12,"name","","",11,null],[12,"fields","","",11,null],[3,"ClassDecl","","",null,null],[12,"range","","",12,null],[12,"name","","",12,null],[12,"fields","","",12,null],[3,"RelDecl","","",null,null],[12,"cardinality","","",13,null],[12,"field","","",13,null],[3,"Field","","",null,null],[12,"range","","",14,null],[12,"name","","",14,null],[12,"ty","","",14,null],[12,"relation","","",14,null],[3,"EnumDecl","","",null,null],[12,"range","","",15,null],[12,"name","","",15,null],[12,"variants","","",15,null],[3,"Variant","","",null,null],[12,"range","","",16,null],[12,"name","","",16,null],[12,"ty","","",16,null],[3,"Function","","",null,null],[12,"range","","",17,null],[12,"name","","",17,null],[12,"arguments","","",17,null],[12,"ret_type","","",17,null],[12,"body","","",17,null],[3,"FuncArg","","",null,null],[12,"range","","",18,null],[12,"name","","",18,null],[12,"ty","","",18,null],[3,"Impl","","",null,null],[12,"range","","",19,null],[12,"name","","",19,null],[12,"functions","","",19,null],[3,"CondExp","","",null,null],[12,"condition","","",20,null],[12,"true_val","","",20,null],[12,"false_val","","",20,null],[3,"BinaryOp","","",null,null],[12,"op","","",21,null],[12,"lhs","","",21,null],[12,"rhs","","",21,null],[3,"Subscript","","",null,null],[12,"base","","",22,null],[12,"index","","",22,null],[3,"MemberAccess","","",null,null],[12,"base","","",23,null],[12,"member","","",23,null],[3,"QualAccess","","",null,null],[12,"base","","",24,null],[12,"member","","",24,null],[3,"FuncCall","","",null,null],[12,"function","","",25,null],[12,"arguments","","",25,null],[3,"StructLiteral","","",null,null],[12,"name","","",26,null],[12,"fields","","",26,null],[3,"If","","",null,null],[12,"condition","","",27,null],[12,"then_arm","","",27,null],[12,"else_arm","","",27,null],[3,"Match","","",null,null],[12,"discriminant","","",28,null],[12,"arms","","",28,null],[3,"VarDecl","","",null,null],[12,"name","","",29,null],[12,"ty","","",29,null],[12,"expr","","",29,null],[3,"FunctionTy","","",null,null],[12,"arg_types","","",30,null],[12,"ret_type","","",30,null],[4,"Item","","",null,null],[13,"StructDecl","","",31,null],[13,"ClassDecl","","",31,null],[13,"EnumDecl","","",31,null],[13,"FuncDef","","",31,null],[13,"Impl","","",31,null],[4,"ExpKind","","",null,null],[13,"CondExp","","",32,null],[13,"BinaryOp","","",32,null],[13,"Cast","","",32,null],[13,"UnaryPlus","","",32,null],[13,"UnaryMinus","","",32,null],[13,"LogicNot","","",32,null],[13,"Subscript","","",32,null],[13,"MemberAccess","","",32,null],[13,"QualAccess","","",32,null],[13,"FuncCall","","",32,null],[13,"NilLiteral","","",32,null],[13,"BoolLiteral","","",32,null],[13,"IntLiteral","","",32,null],[13,"FloatLiteral","","",32,null],[13,"StringLiteral","","",32,null],[13,"Identifier","","",32,null],[13,"TupleLiteral","","",32,null],[13,"ArrayLiteral","","",32,null],[13,"StructLiteral","","",32,null],[13,"If","","",32,null],[13,"Match","","",32,null],[13,"Block","","",32,null],[13,"FuncExp","","",32,null],[13,"VarDecl","","",32,null],[13,"Semi","","",32,null],[13,"Empty","","",32,null],[4,"TyKind","","",null,null],[13,"Pointer","","",33,null],[13,"Optional","","",33,null],[13,"Tuple","","",33,null],[13,"Array","","",33,null],[13,"Function","","",33,null],[13,"Named","","",33,null],[6,"Prog","","",null,null],[6,"Exp","","",null,null],[6,"Ty","","",null,null],[11,"fmt","","",10,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",31,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",32,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",33,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",11,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",12,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",13,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",14,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",15,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",16,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",17,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",18,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",19,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",20,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",21,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",22,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",23,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",24,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",25,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",26,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",27,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",28,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",29,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",30,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"range","","",11,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",12,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",14,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",15,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",16,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",17,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",18,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",19,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",10,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[11,"range","","",31,{"inputs":[{"name":"self"}],"output":{"name":"range"}}],[0,"parser","phile","",null,null],[5,"parse","phile::parser","",null,null],[0,"sqir","phile","",null,null],[3,"BuiltinName","phile::sqir","",null,null],[12,"bool_name","","",34,null],[12,"int_name","","",34,null],[12,"float_name","","",34,null],[12,"decimal_name","","",34,null],[12,"string_name","","",34,null],[12,"blob_name","","",34,null],[12,"date_name","","",34,null],[3,"EnumType","","",null,null],[12,"name","","",35,null],[12,"variants","","",35,null],[3,"StructType","","",null,null],[12,"name","","",36,null],[12,"fields","","",36,null],[3,"ClassType","","",null,null],[12,"name","","",37,null],[12,"fields","","",37,null],[3,"FunctionType","","",null,null],[12,"arg_types","","",38,null],[12,"ret_type","","",38,null],[3,"RelationSide","","",null,null],[12,"class","","",39,null],[12,"field","","",39,null],[12,"cardinality","","",39,null],[3,"Relation","","",null,null],[12,"lhs","","",40,null],[12,"rhs","","",40,null],[3,"Expr","","",null,null],[12,"ty","","",41,null],[12,"value","","",41,null],[12,"id","","",41,null],[3,"Function","","",null,null],[12,"args","","",42,null],[12,"body","","",42,null],[3,"Call","","",null,null],[12,"callee","","",43,null],[12,"args","","",43,null],[3,"Branch","","",null,null],[12,"discriminant","","",44,null],[12,"arms","","",44,null],[3,"Map","","",null,null],[12,"range","","",45,null],[12,"op","","",45,null],[3,"Reduce","","",null,null],[12,"range","","",46,null],[12,"zero","","",46,null],[12,"op","","",46,null],[3,"Filter","","",null,null],[12,"range","","",47,null],[12,"pred","","",47,null],[3,"Sort","","",null,null],[12,"range","","",48,null],[12,"cmp","","",48,null],[3,"Group","","",null,null],[12,"range","","",49,null],[12,"pred","","",49,null],[3,"Sqir","","",null,null],[12,"named_types","","",50,null],[12,"decimal_types","","",50,null],[12,"optional_types","","",50,null],[12,"pointer_types","","",50,null],[12,"array_types","","",50,null],[12,"tuple_types","","",50,null],[12,"function_types","","",50,null],[12,"relations","","",50,null],[12,"globals","","",50,null],[4,"Type","","`Type` is deliberately not Clone, PartialEq and Eq: it is meant to be used only with RcCell/WkCell, and its instances should be compared by address.",null,null],[13,"Bool","","",51,null],[13,"Int","","",51,null],[13,"Float","","",51,null],[13,"Decimal","","",51,null],[12,"integral","phile::sqir::Type","",51,null],[12,"fractional","","",51,null],[13,"String","phile::sqir","",51,null],[13,"Blob","","",51,null],[13,"Date","","",51,null],[13,"Optional","","",51,null],[13,"Pointer","","",51,null],[13,"Array","","",51,null],[13,"Tuple","","",51,null],[13,"Enum","","",51,null],[13,"Struct","","",51,null],[13,"Class","","",51,null],[13,"Function","","",51,null],[13,"Placeholder","","",51,null],[12,"name","phile::sqir::Type","",51,null],[12,"kind","","",51,null],[4,"PlaceholderKind","phile::sqir","",null,null],[13,"Struct","","",52,null],[13,"Class","","",52,null],[13,"Enum","","",52,null],[4,"ComplexTypeKind","","",null,null],[13,"Value","","",53,null],[13,"Entity","","",53,null],[13,"Function","","",53,null],[4,"Cardinality","","",null,null],[13,"ZeroOrOne","","",54,null],[13,"One","","",54,null],[13,"ZeroOrMore","","",54,null],[13,"OneOrMore","","",54,null],[4,"Value","","",null,null],[13,"Placeholder","","",55,null],[13,"Nil","","",55,null],[13,"BoolConst","","",55,null],[13,"IntConst","","",55,null],[13,"FloatConst","","",55,null],[13,"StringConst","","",55,null],[13,"Function","","",55,null],[13,"Call","","",55,null],[13,"FuncArg","","",55,null],[12,"func","phile::sqir::Value","",55,null],[12,"index","","",55,null],[13,"Load","phile::sqir","",55,null],[13,"OptionalWrap","","",55,null],[13,"Ignore","","",55,null],[13,"Neg","","",55,null],[13,"Add","","",55,null],[13,"Sub","","",55,null],[13,"Mul","","",55,null],[13,"Div","","",55,null],[13,"Mod","","",55,null],[13,"Eq","","",55,null],[13,"Neq","","",55,null],[13,"Lt","","",55,null],[13,"LtEq","","",55,null],[13,"Gt","","",55,null],[13,"GtEq","","",55,null],[13,"And","","",55,null],[13,"Or","","",55,null],[13,"Not","","",55,null],[13,"Intersect","","",55,null],[13,"Union","","",55,null],[13,"SetDiff","","",55,null],[13,"Branch","","",55,null],[13,"Seq","","",55,null],[13,"Array","","",55,null],[13,"Tuple","","",55,null],[13,"StructLiteral","","",55,null],[13,"Map","","",55,null],[13,"Reduce","","",55,null],[13,"Filter","","",55,null],[13,"Sort","","",55,null],[13,"Group","","",55,null],[13,"Join","","",55,null],[13,"Insert","","",55,null],[13,"Update","","",55,null],[13,"Project","","",55,null],[13,"GroupBy","","",55,null],[13,"SortBy","","",55,null],[13,"Sum","","",55,null],[13,"Avg","","",55,null],[13,"Min","","",55,null],[13,"Max","","",55,null],[4,"ExprId","","`ExprId` is deliberately not Clone: there should never be any two identical ExprIds.",null,null],[13,"Temp","","",56,null],[13,"Local","","",56,null],[13,"Global","","",56,null],[6,"RcType","","",null,null],[6,"WkType","","",null,null],[6,"RcExpr","","",null,null],[6,"WkExpr","","",null,null],[7,"BUILTIN_NAME","","",null,null],[11,"fmt","","",34,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",34,{"inputs":[{"name":"self"}],"output":{"name":"builtinname"}}],[11,"fmt","","",51,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",52,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",52,{"inputs":[{"name":"self"}],"output":{"name":"placeholderkind"}}],[11,"eq","","",52,{"inputs":[{"name":"self"},{"name":"placeholderkind"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",52,{"inputs":[{"name":"self"},{"name":"placeholderkind"}],"output":{"name":"option"}}],[11,"cmp","","",52,{"inputs":[{"name":"self"},{"name":"placeholderkind"}],"output":{"name":"ordering"}}],[11,"hash","","",52,null],[11,"fmt","","",53,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",53,{"inputs":[{"name":"self"}],"output":{"name":"complextypekind"}}],[11,"eq","","",53,{"inputs":[{"name":"self"},{"name":"complextypekind"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",53,{"inputs":[{"name":"self"},{"name":"complextypekind"}],"output":{"name":"option"}}],[11,"cmp","","",53,{"inputs":[{"name":"self"},{"name":"complextypekind"}],"output":{"name":"ordering"}}],[11,"hash","","",53,null],[11,"fmt","","",35,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",36,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",37,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",38,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",38,{"inputs":[{"name":"self"}],"output":{"name":"functiontype"}}],[11,"fmt","","",39,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",39,{"inputs":[{"name":"self"}],"output":{"name":"relationside"}}],[11,"eq","","",39,{"inputs":[{"name":"self"},{"name":"relationside"}],"output":{"name":"bool"}}],[11,"ne","","",39,{"inputs":[{"name":"self"},{"name":"relationside"}],"output":{"name":"bool"}}],[11,"fmt","","",54,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",54,{"inputs":[{"name":"self"}],"output":{"name":"cardinality"}}],[11,"eq","","",54,{"inputs":[{"name":"self"},{"name":"cardinality"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",54,{"inputs":[{"name":"self"},{"name":"cardinality"}],"output":{"name":"option"}}],[11,"cmp","","",54,{"inputs":[{"name":"self"},{"name":"cardinality"}],"output":{"name":"ordering"}}],[11,"hash","","",54,null],[11,"fmt","","",40,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",41,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",55,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",56,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"eq","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"ne","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"option"}}],[11,"lt","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"le","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"gt","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"ge","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"bool"}}],[11,"cmp","","",56,{"inputs":[{"name":"self"},{"name":"exprid"}],"output":{"name":"ordering"}}],[11,"hash","","",56,null],[11,"fmt","","",42,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",42,{"inputs":[{"name":"self"}],"output":{"name":"function"}}],[11,"fmt","","",43,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",44,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",45,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",46,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",47,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",48,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",49,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",50,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",51,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",52,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"fmt","","",54,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"partial_cmp","","",39,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"option"}}],[11,"cmp","","",39,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"ordering"}}],[11,"eq","","",40,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",40,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"option"}}],[11,"cmp","","",40,{"inputs":[{"name":"self"},{"name":"self"}],"output":{"name":"ordering"}}],[11,"new","","",50,{"inputs":[],"output":{"name":"sqir"}}],[11,"unique_relations","","",50,{"inputs":[{"name":"self"}],"output":{"name":"btreeset"}}],[11,"default","","",50,{"inputs":[],"output":{"name":"sqir"}}],[0,"sqirgen","phile","",null,null],[5,"generate_sqir","phile::sqirgen","",null,null],[0,"sqiropt","phile","",null,null],[5,"optimize_sqir","phile::sqiropt","",null,{"inputs":[{"name":"sqir"}],"output":{"name":"sqir"}}],[0,"codegen","phile","",null,null],[3,"CodegenParams","phile::codegen","",null,null],[12,"database","","",57,null],[12,"language","","",57,null],[12,"database_access_mode","","",57,null],[12,"namespace","","",57,null],[12,"type_name_transform","","",57,null],[12,"field_name_transform","","",57,null],[12,"variant_name_transform","","",57,null],[12,"func_name_transform","","",57,null],[12,"namespace_transform","","",57,null],[4,"DatabaseEngine","","",null,null],[13,"SQLite3","","",58,null],[13,"MongoDB","","",58,null],[13,"MariaDB","","",58,null],[4,"Language","","",null,null],[13,"Rust","","",59,null],[13,"C","","",59,null],[13,"CXX","","",59,null],[13,"ObjectiveC","","",59,null],[13,"Swift","","",59,null],[13,"Go","","",59,null],[13,"JavaScript","","",59,null],[13,"Python","","",59,null],[13,"Java","","",59,null],[4,"DatabaseAccessMode","","",null,null],[13,"Pod","","",60,null],[13,"ActiveRecord","","",60,null],[4,"NameTransform","","",null,null],[13,"Identity","","",61,null],[13,"LowerSnakeCase","","",61,null],[13,"UpperSnakeCase","","",61,null],[13,"LowerCamelCase","","",61,null],[13,"UpperCamelCase","","",61,null],[5,"transform_type_name","","",null,{"inputs":[{"name":"str"},{"name":"codegenparams"}],"output":{"name":"string"}}],[5,"transform_field_name","","",null,{"inputs":[{"name":"str"},{"name":"codegenparams"}],"output":{"name":"string"}}],[5,"transform_variant_name","","",null,{"inputs":[{"name":"str"},{"name":"codegenparams"}],"output":{"name":"string"}}],[5,"transform_func_name","","",null,{"inputs":[{"name":"str"},{"name":"codegenparams"}],"output":{"name":"string"}}],[5,"transform_namespace","","",null,{"inputs":[{"name":"str"},{"name":"codegenparams"}],"output":{"name":"string"}}],[6,"WriterProvider","","",null,null],[11,"fmt","","",58,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",58,{"inputs":[{"name":"self"}],"output":{"name":"databaseengine"}}],[11,"eq","","",58,{"inputs":[{"name":"self"},{"name":"databaseengine"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",58,{"inputs":[{"name":"self"},{"name":"databaseengine"}],"output":{"name":"option"}}],[11,"cmp","","",58,{"inputs":[{"name":"self"},{"name":"databaseengine"}],"output":{"name":"ordering"}}],[11,"hash","","",58,null],[11,"fmt","","",59,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",59,{"inputs":[{"name":"self"}],"output":{"name":"language"}}],[11,"eq","","",59,{"inputs":[{"name":"self"},{"name":"language"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",59,{"inputs":[{"name":"self"},{"name":"language"}],"output":{"name":"option"}}],[11,"cmp","","",59,{"inputs":[{"name":"self"},{"name":"language"}],"output":{"name":"ordering"}}],[11,"hash","","",59,null],[11,"fmt","","",60,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",60,{"inputs":[{"name":"self"}],"output":{"name":"databaseaccessmode"}}],[11,"eq","","",60,{"inputs":[{"name":"self"},{"name":"databaseaccessmode"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",60,{"inputs":[{"name":"self"},{"name":"databaseaccessmode"}],"output":{"name":"option"}}],[11,"cmp","","",60,{"inputs":[{"name":"self"},{"name":"databaseaccessmode"}],"output":{"name":"ordering"}}],[11,"hash","","",60,null],[11,"fmt","","",61,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",61,{"inputs":[{"name":"self"}],"output":{"name":"nametransform"}}],[11,"eq","","",61,{"inputs":[{"name":"self"},{"name":"nametransform"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",61,{"inputs":[{"name":"self"},{"name":"nametransform"}],"output":{"name":"option"}}],[11,"cmp","","",61,{"inputs":[{"name":"self"},{"name":"nametransform"}],"output":{"name":"ordering"}}],[11,"hash","","",61,null],[11,"fmt","","",57,{"inputs":[{"name":"self"},{"name":"formatter"}],"output":{"name":"result"}}],[11,"clone","","",57,{"inputs":[{"name":"self"}],"output":{"name":"codegenparams"}}],[11,"eq","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"ne","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"partial_cmp","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"option"}}],[11,"lt","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"le","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"gt","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"ge","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"bool"}}],[11,"cmp","","",57,{"inputs":[{"name":"self"},{"name":"codegenparams"}],"output":{"name":"ordering"}}],[11,"hash","","",57,null],[0,"dalgen","phile","",null,null],[5,"generate_dal","phile::dalgen","",null,{"inputs":[{"name":"sqir"},{"name":"codegenparams"},{"name":"writerprovider"}],"output":{"name":"result"}}]],"paths":[[3,"PackageInfo"],[3,"Color"],[3,"RcCell"],[3,"WkCell"],[4,"Error"],[3,"Location"],[3,"Range"],[3,"Token"],[4,"TokenKind"],[8,"Ranged"],[3,"Node"],[3,"StructDecl"],[3,"ClassDecl"],[3,"RelDecl"],[3,"Field"],[3,"EnumDecl"],[3,"Variant"],[3,"Function"],[3,"FuncArg"],[3,"Impl"],[3,"CondExp"],[3,"BinaryOp"],[3,"Subscript"],[3,"MemberAccess"],[3,"QualAccess"],[3,"FuncCall"],[3,"StructLiteral"],[3,"If"],[3,"Match"],[3,"VarDecl"],[3,"FunctionTy"],[4,"Item"],[4,"ExpKind"],[4,"TyKind"],[3,"BuiltinName"],[3,"EnumType"],[3,"StructType"],[3,"ClassType"],[3,"FunctionType"],[3,"RelationSide"],[3,"Relation"],[3,"Expr"],[3,"Function"],[3,"Call"],[3,"Branch"],[3,"Map"],[3,"Reduce"],[3,"Filter"],[3,"Sort"],[3,"Group"],[3,"Sqir"],[4,"Type"],[4,"PlaceholderKind"],[4,"ComplexTypeKind"],[4,"Cardinality"],[4,"Value"],[4,"ExprId"],[3,"CodegenParams"],[4,"DatabaseEngine"],[4,"Language"],[4,"DatabaseAccessMode"],[4,"NameTransform"]]};
searchIndex["philec"] = {"doc":"","items":[],"paths":[]};
initSearch(searchIndex);
