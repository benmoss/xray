require('../spec_helper');
describe('DesiredLrpScale', function() {
  var desiredLrp, DesiredLrpsApi;
  beforeEach(function() {
    desiredLrp = Factory.build('desiredLrp', {instances: 4});
    DesiredLrpsApi = require('../../../app/api/desired_lrps_api');

    var DesiredLrpScale = require('../../../app/components/desired_lrp_scale');
    React.render(<DesiredLrpScale {...{desiredLrp}}/>, root);
  });

  it('has an input with the current number of instances', function() {
    expect('input[type=number]').toHaveValue('4');
  });

  describe('scaling the desired lrp', function() {
    beforeEach(function() {
      spyOn(DesiredLrpsApi, 'scale');
      $('input[type=number]').val(8).simulate('change');
      $('form').simulate('submit');
    });
    it('calls Receptor api with the desired lrp and the number to scale to', function(){
      expect(DesiredLrpsApi.scale).toHaveBeenCalledWith(desiredLrp, 8);
    });
  });

  describe('destroying the desired lrp', function() {
    beforeEach(function() {
      spyOn(DesiredLrpsApi, 'destroy');
      $('button:contains("destroy")').simulate('click');
    });

    xit('opens a warning/confirmation modal', function() {

    });
  });

});