import { Card, ListGroup } from "react-bootstrap";
import {externalRole} from "perspectives-react";

export function SelectContext(props)
{
  return  <Card>
              <Card.Body>
                <Card.Title>There are multiple matches to your query</Card.Title>
                <ListGroup variant="flush">{
                  Object.keys( props.indexedContextNameMapping ).map(
                  function(externalRoleId)
                  {
                    const namePartMatch = externalRoleId.match(/\$(.*)/);
                    return <ListGroup.Item key={externalRoleId}><a title={externalRoleId} href={"/?" + externalRole ( props.indexedContextNameMapping[externalRoleId] )}>{namePartMatch[1]}</a></ListGroup.Item>;
                  }
                )
              }</ListGroup>
            </Card.Body>
          </Card>;
}
