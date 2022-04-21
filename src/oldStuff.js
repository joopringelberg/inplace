// indexedContextNameMapping = Object String, holding at least one key-value pair.
function RequestedContext(contextId, indexedContextNameMapping, mySystem, component)
{
  if ( !contextId && Object.keys( indexedContextNameMapping ).length > 1 )
  {
    return  <Card>
              <Card.Body>
                <Card.Title>There are multiple matches to your query</Card.Title>
                <ListGroup variant="flush">{
                  Object.keys( indexedContextNameMapping ).map(
                  function(externalRoleId)
                  {
                    const namePartMatch = externalRoleId.match(/\$(.*)/);
                    return <ListGroup.Item key={externalRoleId}><a title={externalRoleId} href={"/?" + externalRole ( indexedContextNameMapping[externalRoleId] )}>{namePartMatch[1]}</a></ListGroup.Item>;
                  }
                )
              }</ListGroup>
            </Card.Body>
          </Card>;
  }
  else if ( contextId )
  {
    return  <ContextInstance contextinstance={contextId}>
            <ExternalRole>
              <PSRol.Consumer>
                { function (psrol)
                  {
                    history.pushState({ selectedContext: psrol.rolinstance }, "");
                    // console.log("Pushing context state " + psrol.rolinstance);
                    return <PerspectivesContainer systemcontextinstance={mySystem}>
                        <Screen rolinstance={psrol.rolinstance}/>
                      </PerspectivesContainer>;
                  }
                }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
  else
  {
    return  <ContextInstance contextinstance={indexedContextNameMapping[ Object.keys( indexedContextNameMapping )[0] ]}>
            <ExternalRole>
              <PSRol.Consumer>
                { function (psrol)
                  {
                    history.pushState({ selectedContext: psrol.rolinstance }, "");
                    // console.log("Pushing context state " + psrol.rolinstance);
                    return <PerspectivesContainer systemcontextinstance={mySystem}>
                      <Screen rolinstance={psrol.rolinstance}/>
                    </PerspectivesContainer>;
                  }
                }
              </PSRol.Consumer>
            </ExternalRole>
          </ContextInstance>;
  }
}

// eslint-disable-next-line react/prop-types
function OpenRoleForm( {roleid, viewname, cardprop} )
{
  return  <ContextOfRole rolinstance={roleid}>
            <RoleInstance roleinstance={roleid}>
              <View viewname={viewname}>
              <RoleFormInView cardprop={cardprop}/>
              </View>
            </RoleInstance>
          </ContextOfRole>;
}

function ApplicationSwitcher(mySystem, component)
{
  function handleClick(roleinstance, e)
  {
    if (e.shiftKey || e.ctrlKey || e.metaKey)
    {
      window.open("/?" + roleinstance);
      e.preventDefault();
      e.stopPropagation();
    }

  }
  return  <AppListTabContainer rol="IndexedContexts">
            <Row className="align-items-stretch">
              <Col lg={3} className="App-border-right">
                <Nav variant="pills" className="flex-column" aria-label="Apps" aria-orientation="vertical">
                  <RoleInstanceIterator>
                    <View viewname="allProperties">
                      <PSView.Consumer>
                        {roleinstance => <Nav.Item>
                            <Nav.Link eventKey={roleinstance.rolinstance} onSelect={handleClick}>{roleinstance.propval("Name")}</Nav.Link>
                          </Nav.Item>}
                      </PSView.Consumer>
                    </View>
                  </RoleInstanceIterator>
                </Nav>
              </Col>
              <Col lg={9}>
                <Tab.Content>
                  <RoleInstanceIterator>
                    <PSRol.Consumer>{ psrol =>
                      {
                        history.pushState({ selectedContext: psrol.rolinstance }, "");
                        return  <Tab.Pane eventKey={psrol.rolinstance}>
                                  <PerspectivesContainer systemcontextinstance={mySystem}>
                                    <Screen rolinstance={psrol.rolinstance}/>
                                  </PerspectivesContainer>;
                                </Tab.Pane>;
                      }
                    }</PSRol.Consumer>
                  </RoleInstanceIterator>
                </Tab.Content>
              </Col>
            </Row>
          </AppListTabContainer>;
}


////////////////////////////////////////////////////////////////////////////////
// APPLISTTABCONTAINER
////////////////////////////////////////////////////////////////////////////////
function AppListTabContainer (props)
{
  class AppListTabContainer_ extends React.PureComponent
  {
    constructor(props)
    {
      super(props);
      this.state={};
    }
    componentDidMount()
    {
      if (this.context.instances[0])
      {
        this.setState({ firstApp: this.context.instances[0] });
      }
    }

    componentDidUpdate()
    {
      if (this.context.instances[0])
      {
        this.setState({ firstApp: this.context.instances[0] });
      }
    }

    render ()
    {
      if (this.state.firstApp)
      {
        return  <Tab.Container id="apps" mountOnEnter={true} unmountOnExit={true} defaultActiveKey={this.state.firstApp}>
                  { // eslint-disable-next-line react/prop-types
                    this.props.children}
                </Tab.Container>;
      }
      else {
        return <div/>;
      }
    }
  }
  AppListTabContainer_.contextType = PSRoleInstances;

  return (<RoleInstances rol={props.rol}>
      <AppListTabContainer_>{
         // eslint-disable-next-line react/prop-types
        props.children }</AppListTabContainer_>
    </RoleInstances>);
}

AppListTabContainer.propTypes = { "rol": PropTypes.string.isRequired };
