export default class Greetings extends React.Component
{
    render()
    {
        return React.createElement('h1', null, 'Greetings, ' + this.props.name + '!');
    }
}