module Api.Object.RefConnection exposing (..)

import Api.Object
import Graphqelm.Argument as Argument exposing (Argument)
import Graphqelm.Field as Field exposing (Field, FieldDecoder)
import Graphqelm.Object as Object exposing (Object)
import Json.Decode as Decode


build : (a -> constructor) -> Object (a -> constructor) Api.Object.RefConnection
build constructor =
    Object.object constructor


edges : Object edges Api.Object.RefEdge -> FieldDecoder (List edges) Api.Object.RefConnection
edges object =
    Object.listOf "edges" [] object


nodes : Object nodes Api.Object.Ref -> FieldDecoder (List nodes) Api.Object.RefConnection
nodes object =
    Object.listOf "nodes" [] object


pageInfo : Object pageInfo Api.Object.PageInfo -> FieldDecoder pageInfo Api.Object.RefConnection
pageInfo object =
    Object.single "pageInfo" [] object


totalCount : FieldDecoder Int Api.Object.RefConnection
totalCount =
    Field.fieldDecoder "totalCount" [] Decode.int