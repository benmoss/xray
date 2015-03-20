require('../spec_helper');

describe('DesiredLrpDetail', function() {
  var ActualLrpList, DesiredLrp, Cursor, subject, actualLrps, desiredLrps, $receptor, $selection;
  function render(options = {}) {
    var DesiredLrpDetail = require('../../../app/components/desired_lrp_detail');

    actualLrps = [
      Factory.build('actualLrp', {process_guid: 'Amazon'}),
      Factory.build('actualLrp', {process_guid: 'Diego'}),
      Factory.build('actualLrp', {process_guid: 'Diego'}),
      Factory.build('actualLrp', {process_guid: 'Diego', state: 'CLAIMED'})
    ];
    var selectedDesiredLrp = Factory.build('desiredLrp', {process_guid: 'Amazon', instances: 5});
    desiredLrps = [
      selectedDesiredLrp,
      Factory.build('desiredLrp', {process_guid: 'Diego', instances: 3})
    ];

    Cursor = require('../../../app/lib/cursor');
    var actualLrpsByProcessGuid = {
      Amazon: [actualLrps[0]],
      Diego: [actualLrps[1], actualLrps[2], actualLrps[3]]
    };
    $receptor = new Cursor({desiredLrps, actualLrps, actualLrpsByProcessGuid}, jasmine.createSpy('callback'));
    $selection = new Cursor({selectedDesiredLrp}, jasmine.createSpy('callback'));
    var $sidebar = new Cursor({}, jasmine.createSpy('callback'));
    var colors = ['#fff', '#000'];
    React.withContext(Object.assign({colors, allowModifications: true}, options), function() {
      subject = React.render(<DesiredLrpDetail {...{$receptor, $selection, $sidebar}}/>, root);
    });
  }

  beforeEach(function() {
    ActualLrpList = require('../../../app/components/actual_lrp_list');
    spyOn(ActualLrpList.type.prototype, 'render').and.callThrough();
    DesiredLrp = require('../../../app/components/desired_lrp');
    spyOn(DesiredLrp.type.prototype, 'render').and.callThrough();
    render();
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  it('renders a desired lrp', function() {
    expect('.desired-lrp-detail').toExist();
    expect(DesiredLrp.type.prototype.render).toHaveBeenCalled();
  });

  it('renders the expected lrps count', function() {
    expect('.desired-lrp-detail').toContainText('1/5');
  });

  it('renders a scaling widget', function() {
    expect('.desired-lrp-scale').toHaveLength(1);
  });

  it('renders actual lrp list', function() {
    expect(ActualLrpList.type.prototype.render).toHaveBeenCalled();
  });

  describe('when the desiredLrp has been deleted', function() {
    var deletedLrp;
    beforeEach(function() {
      deletedLrp = Factory.build('desiredLrp', {process_guid: 'Heroku'});
      $selection = new Cursor({selectedDesiredLrp: deletedLrp});
      subject.setProps({$selection});
    });

    it('renders a header with the old data', function() {
      expect('.desired-lrp-detail').toContainText('Heroku');
    });

    it('renders a message instead of the actual lrps', function() {
      expect('.desired-lrp-detail').toContainText('This process has been deleted');
    });
  });

  describe('with modifications turned off', function() {
    beforeEach(function() {
      React.unmountComponentAtNode(root);
      render({allowModifications: false});
    });

    it('does not have a scaling widget', function() {
      expect('.desired-lrp-scale').not.toExist();
    });
  });
});
