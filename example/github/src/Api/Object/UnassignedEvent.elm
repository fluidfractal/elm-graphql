module Api.Object.UnassignedEvent exposing (..)

import Api.Object
import Graphqelm.Argument as Argument exposing (Argument)
import Graphqelm.Field as Field exposing (Field, FieldDecoder)
import Graphqelm.Object as Object exposing (Object)
import Json.Decode as Decode


build : (a -> constructor) -> Object (a -> constructor) Api.Object.UnassignedEvent
build constructor =
    Object.object constructor


actor : Object actor Api.Object.Actor -> FieldDecoder actor Api.Object.UnassignedEvent
actor object =
    Object.single "actor" [] object


assignable : Object assignable Api.Object.Assignable -> FieldDecoder assignable Api.Object.UnassignedEvent
assignable object =
    Object.single "assignable" [] object


createdAt : FieldDecoder String Api.Object.UnassignedEvent
createdAt =
    Field.fieldDecoder "createdAt" [] Decode.string


id : FieldDecoder String Api.Object.UnassignedEvent
id =
    Field.fieldDecoder "id" [] Decode.string


user : Object user Api.Object.User -> FieldDecoder user Api.Object.UnassignedEvent
user object =
    Object.single "user" [] object