require('../spec_helper');

describe('Container', function() {
  var subject, modalSpy, update;
  beforeEach(function() {
    update = React.addons.update;
    var Container = require('../../../app/components/container');

    var actualLrp = Factory.build('actualLrp');
    var desiredLrp = Factory.build('desiredLrp');
    var denominator = 50;

    modalSpy = jasmine.createSpyObj('modal', ['open']);

    React.withContext({colors: ['#fff', '#000'], scaling: 'containers', modal: modalSpy}, function() {
      subject = React.render(<Container {...{actualLrp, denominator, desiredLrp}}/>, root);
    });
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  it('renders a container', function() {
    expect('.container').toExist();
  });

  it('does not add the claimed class to the container', function() {
    expect(subject.props.actualLrp.state).toEqual('RUNNING');
    expect('.container').not.toHaveClass('claimed');
  });

  describe('when clicking on the container', function() {
    beforeEach(function() {
      $('.container').simulate('click');
    });

    it('opens a modal', function() {
      expect(modalSpy.open).toHaveBeenCalled();
    });
  });

  describe('when the state of the actual lrp is CLAIMED', function() {
    beforeEach(function() {
      subject.setProps({actualLrp: update(subject.props.actualLrp, {$set: {state: 'CLAIMED'}})});
    });

    it('adds the claimed class', function() {
      expect('.container').toHaveClass('claimed');
    });
  });
});