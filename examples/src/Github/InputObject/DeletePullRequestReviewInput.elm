-- Do not manually edit this file, it was auto-generated by Graphqelm
-- https://github.com/dillonkearns/graphqelm


module Github.InputObject.DeletePullRequestReviewInput exposing (..)

import Github.Interface
import Github.Object
import Github.Scalar
import Github.Union
import Graphqelm.Field as Field exposing (Field)
import Graphqelm.Internal.Builder.Argument as Argument exposing (Argument)
import Graphqelm.Internal.Builder.Object as Object
import Graphqelm.Internal.Encode as Encode exposing (Value)
import Graphqelm.OptionalArgument exposing (OptionalArgument(Absent))
import Graphqelm.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


{-| Encode a DeletePullRequestReviewInput into a value that can be used as an argument.
-}
encode : DeletePullRequestReviewInput -> Value
encode input =
    Encode.maybeObject
        [ ( "clientMutationId", Encode.string |> Encode.optional input.clientMutationId ), ( "pullRequestReviewId", (\(Github.Scalar.Id raw) -> Encode.string raw) input.pullRequestReviewId |> Just ) ]


{-| Type for the DeletePullRequestReviewInput input object.
-}
type alias DeletePullRequestReviewInput =
    { clientMutationId : OptionalArgument String, pullRequestReviewId : Github.Scalar.Id }