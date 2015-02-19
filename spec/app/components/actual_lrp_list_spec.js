require('../spec_helper');

describe('ActualLrpList', function() {
  var actualLrps, subject;
  beforeEach(function() {
    var ActualLrpList = require('../../../app/components/actual_lrp_list');
    actualLrps = [
      Factory.build('actualLrp', {index: 0}),
      Factory.build('actualLrp', {index: 1, state: 'UNCLAIMED'}),
      Factory.build('actualLrp', {index: 2, state: 'CRASHED'}),
      Factory.build('actualLrp', {index: 3, state: 'UNCLAIMED', placement_error: 'We crossed the streams'})
    ];
    subject = React.render(<ActualLrpList {...{actualLrps}}/>, root);
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  it('renders actual lrps', function() {
    expect('.actual-lrp').toHaveLength(actualLrps.length);
  });

  it('renders crashed lrps with errors', function() {
    expect('.actual-lrp:eq(0)').not.toHaveClass('bg-error-1');
    expect('.actual-lrp:eq(1)').not.toHaveClass('bg-error-1');
    expect('.actual-lrp:eq(2)').toHaveClass('bg-error-1');
  });

  it('renders lrps with placement errors with errors', function() {
    expect('.actual-lrp:eq(3)').toHaveClass('bg-error-1');
    expect('.actual-lrp:eq(3)').not.toHaveClass('faded');
    expect('.actual-lrp:eq(3)').toContainText('We crossed the streams');
  });

  it('renders unclaimed lrps faded and gray', function() {
    expect('.actual-lrp:eq(0)').not.toHaveClass('faded');
    expect('.actual-lrp:eq(1)').toHaveClass('faded');
    expect('.actual-lrp:eq(2)').not.toHaveClass('faded');
  });
});